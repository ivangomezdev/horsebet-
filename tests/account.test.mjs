import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { randomBytes } from "node:crypto";
import { encryptKyc, decryptKyc } from "../lib/account/encryption.js";
import {
  formatAtomic,
  validAdultBirthDate,
  kycSchema,
  settingsSchema,
} from "../lib/account/validation.js";
import {
  registerSchema,
  safeReturnTo,
  countryFromLocale,
} from "../lib/auth/validation.js";

test("validation rejects privilege injection, invalid dates and external redirects", () => {
  assert.equal(
    settingsSchema.safeParse({
      section: "phone",
      country: "MX",
      phone: "12345",
    }).success,
    false,
  );
  assert.equal(
    kycSchema.safeParse({
      fullName: "Example Person",
      birthDate: "2015-01-01",
      country: "MX",
      address: "Example Street",
      city: "Example",
      postalCode: "00000",
      politicallyExposed: false,
    }).success,
    false,
  );
  assert.equal(validAdultBirthDate("2000-02-30"), false);
  assert.equal(validAdultBirthDate("2000-01-01"), true);
  assert.equal(
    settingsSchema.safeParse({
      section: "preferences",
      emailPromotions: true,
      smsPromotions: false,
      balance: 100,
    }).success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({
      username: "player_1",
      email: "user@example.invalid",
      password: "long unique phrase",
      country: "MX",
      accepted: false,
    }).success,
    false,
  );
  for (const path of [
    "https://evil.invalid",
    "//evil.invalid",
    "/\\evil.invalid",
    "/es/\r\nHeader:value",
  ])
    assert.equal(safeReturnTo(path), "/es/");
  assert.equal(safeReturnTo("/es/casino/?ignored=1"), "/es/casino/");
  assert.equal(countryFromLocale("es-MX"), "MX");
  assert.equal(countryFromLocale("es"), null);
});
test("money remains precise above the JavaScript safe integer limit", () => {
  assert.equal(
    formatAtomic("9007199254740993123456", 6, 6),
    "9,007,199,254,740,993.123456",
  );
  assert.equal(formatAtomic("-12345", 2), "-123.45");
});
test("KYC encryption is authenticated and bound to its owner", () => {
  const key = randomBytes(32).toString("base64");
  const value = { fullName: "Example Person" };
  const ciphertext = encryptKyc(value, "user-a", key);
  assert.deepEqual(decryptKyc(ciphertext, "user-a", key), value);
  assert.ok(!ciphertext.includes("Example"));
  assert.throws(() => decryptKyc(ciphertext, "user-b", key));
  assert.throws(() =>
    decryptKyc(ciphertext, "user-a", randomBytes(32).toString("base64")),
  );
  assert.notEqual(ciphertext, encryptKyc(value, "user-a", key));
});

test("database migrations enforce ownership, ledger invariants, persistence and revocation", async (t) => {
  const db = new PGlite();
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;grant usage on schema auth,public to authenticated,anon,service_role;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  for (const file of [
    "202610270001_accounts.sql",
    "202610270002_account_center.sql",
    "202610270003_support_chat.sql",
  ])
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/" + file, import.meta.url),
        "utf8",
      ),
    );
  const a = "11111111-1111-4111-8111-111111111111",
    b = "22222222-2222-4222-8222-222222222222";
  const sa = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    sb = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const claims = async (user, session) => {
    await db.query(
      "select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",
      [user, JSON.stringify({ sub: user, session_id: session })],
    );
  };
  const scalar = async (sql, args = []) => (await db.query(sql, args)).rows[0];
  await db.query(
    `insert into auth.users(id,email,raw_user_meta_data) values($1,'a@example.invalid','{"username":"player_a","balance":999999,"kyc":"verified"}'),($2,'b@example.invalid','{"username":"player_b"}')`,
    [a, b],
  );
  // Upgrade existing accounts, then verify provisioning for a subsequent signup.
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/202610270004_member_navigation.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const futureUser = "44444444-4444-4444-8444-444444444444";
  await db.query(
    "insert into auth.users(id,email,raw_user_meta_data) values($1,'c@example.invalid','{\"username\":\"player_c\"}')",
    [futureUser],
  );
  const futureWallets = (
    await db.query(
      "select balance_atomic::text as balance from public.ledger_accounts where user_id=$1",
      [futureUser],
    )
  ).rows;
  assert.equal(futureWallets.length, 12);
  assert.ok(futureWallets.every((row) => row.balance === "0"));
  await db.query(
    "select public.complete_user_profile($1,'player_a','MX',null,null),public.complete_user_profile($2,'player_b','MX',null,null)",
    [a, b],
  );
  const accounts = (
    await db.query(
      "select id,user_id,kind,currency from public.ledger_accounts",
    )
  ).rows;
  const walletA = accounts.find(
      (x) => x.user_id === a && x.kind === "user" && x.currency === "USDT",
    ).id,
    walletB = accounts.find(
      (x) => x.user_id === b && x.kind === "user" && x.currency === "USDT",
    ).id,
    clearing = accounts.find((x) => x.kind === "clearing").id;
  await t.test(
    "fresh wallets and KYC ignore user-supplied privilege metadata",
    async () => {
      assert.equal(
        (
          await scalar(
            "select balance_atomic::text as balance from public.ledger_accounts where id=$1",
            [walletA],
          )
        ).balance,
        "0",
      );
      assert.equal(
        (
          await scalar(
            "select status from public.kyc_status where user_id=$1",
            [a],
          )
        ).status,
        "not_started",
      );
    },
  );
  await t.test(
    "players cannot read other users or mutate security/financial tables",
    async () => {
      await claims(a, sa);
      await db.exec("set role authenticated");
      await db.query("select public.touch_user_session()");
      assert.equal(
        (await db.query("select id from public.profiles")).rows.length,
        1,
      );
      assert.equal(
        (await db.query("select * from public.profiles where id=$1", [b])).rows
          .length,
        0,
      );
      for (const sql of [
        "update public.ledger_accounts set balance_atomic=100",
        "update public.kyc_status set status='verified'",
        "select public.resolve_login_email('player_b')",
        "select * from private.kyc_submissions",
        "select public.post_ledger_transfer(null,null,1,null,'x')",
      ])
        await assert.rejects(db.query(sql));
      await db.exec("reset role");
    },
  );
  await t.test(
    "ledger transfer is balanced, idempotent and rejects overdrafts",
    async () => {
      const key = "33333333-3333-4333-8333-333333333333";
      const args = [clearing, walletA, "1000000", key, "test-credit"];
      await db.exec("set role service_role");
      const first = await scalar(
        "select public.post_ledger_transfer($1,$2,$3,$4,$5) as id",
        args,
      );
      assert.deepEqual(
        first,
        await scalar(
          "select public.post_ledger_transfer($1,$2,$3,$4,$5) as id",
          args,
        ),
      );
      await assert.rejects(
        db.query("select public.post_ledger_transfer($1,$2,2,$3,$4)", [
          clearing,
          walletA,
          key,
          "test-credit",
        ]),
        /Idempotency conflict/,
      );
      await assert.rejects(
        db.query("select public.post_ledger_transfer($1,$2,2000000,$3,$4)", [
          walletA,
          walletB,
          "44444444-4444-4444-8444-444444444444",
          "overdraft",
        ]),
        /Insufficient balance/,
      );
      await assert.rejects(
        db.query("select public.post_ledger_transfer($1,$2,1.5,$3,$4)", [
          walletA,
          walletB,
          "55555555-5555-4555-8555-555555555555",
          "fraction",
        ]),
        /Invalid transfer/,
      );
      await assert.rejects(
        db.query("update public.ledger_accounts set balance_atomic=9000"),
      );
      await db.exec("reset role");
      assert.equal(
        (
          await scalar(
            "select sum(amount_atomic)::text as total from public.ledger_entries",
          )
        ).total,
        "0",
      );
      assert.equal(
        (
          await scalar(
            "select balance_atomic::text as balance from public.ledger_accounts where id=$1",
            [walletA],
          )
        ).balance,
        "1000000",
      );
      await assert.rejects(
        db.query("update public.ledger_entries set amount_atomic=0"),
        /append-only/,
      );
    },
  );
  await t.test(
    "settings persist and KYC submission locks editing without self-approval",
    async () => {
      await db.query(
        "select public.save_account_settings($1,'preferences',$2)",
        [a, JSON.stringify({ emailPromotions: true, smsPromotions: false })],
      );
      assert.equal(
        (
          await scalar(
            "select email_promotions from public.profiles where id=$1",
            [a],
          )
        ).email_promotions,
        true,
      );
      await db.query("select public.save_kyc_draft($1,$2)", [
        a,
        "v1.encrypted-test-payload",
      ]);
      await assert.rejects(
        db.query("select public.submit_kyc($1)", [a]),
        /Missing/,
      );
      await assert.rejects(
        db.query("select public.register_account_file($1,$2,$3,100)", [
          a,
          "identity_front",
          `${b}/file.webp`,
        ]),
        /Invalid file/,
      );
      await db.query("select public.register_account_file($1,$2,$3,100)", [
        a,
        "identity_front",
        `${a}/file.webp`,
      ]);
      await db.query("select public.submit_kyc($1)", [a]);
      assert.equal(
        (
          await scalar(
            "select status from public.kyc_status where user_id=$1",
            [a],
          )
        ).status,
        "in_review",
      );
      await assert.rejects(
        db.query("select public.save_kyc_draft($1,$2)", [a, "new"]),
        /locked/,
      );
    },
  );
  await t.test(
    "support messages persist atomically, deduplicate retries and isolate accounts",
    async () => {
      await claims(a, sa);
      await db.exec("set role authenticated");
      const requestId = "33333333-3333-4333-8333-333333333333";
      const first = (
        await db.query("select * from public.send_support_message($1,$2)", [
          requestId,
          "Necesito ayuda con una ronda demo",
        ])
      ).rows;
      assert.equal(first.length, 2);
      assert.deepEqual(
        first.map((m) => m.sender),
        ["user", "automatic"],
      );
      const again = (
        await db.query("select * from public.send_support_message($1,$2)", [
          requestId,
          "Necesito ayuda con una ronda demo",
        ])
      ).rows;
      assert.deepEqual(
        again.map((m) => m.id),
        first.map((m) => m.id),
      );
      await assert.rejects(
        db.query(
          "insert into public.support_messages(user_id,request_id,sender,text) values($1,$2,'agent','fake')",
          [a, requestId],
        ),
        /permission denied/,
      );
      await claims(b, sb);
      assert.equal(
        (await db.query("select * from public.support_messages")).rows.length,
        0,
      );
      await claims(a, sa);
      assert.equal(
        (await db.query("select * from public.support_messages")).rows.length,
        2,
      );
      await assert.rejects(
        db.query("select * from public.send_support_message($1,'   ')", [
          requestId,
        ]),
        /INVALID_MESSAGE/,
      );
      await db.exec("reset role");
    },
  );
  await t.test(
    "member wallets, vault transfers, preferences and notifications remain owned and precise",
    async () => {
      await claims(a, sa);
      const notificationA = "66666666-6666-4666-8666-666666666666";
      await db.query(
        "insert into public.member_notifications(id,user_id,title,body) values($1,$2,'Aviso de prueba','Solo cuenta A')",
        [notificationA, a],
      );
      await db.exec("set role authenticated");
      const overview = async () =>
        (await scalar("select public.get_member_overview() as data")).data;
      let member = await overview();
      assert.equal(member.wallets.filter((w) => w.kind === "user").length, 6);
      assert.equal(member.wallets.filter((w) => w.kind === "vault").length, 6);
      assert.equal(member.points, "0");
      assert.equal(member.unread, 1);
      await assert.rejects(
        db.exec("update public.loyalty_progress set points=900000"),
      );
      await db.query("select public.save_member_preferences('SOL',true,true)");
      assert.deepEqual((await overview()).preferences, {
        currency: "SOL",
        hide_zero: true,
        include_vault: true,
      });
      await assert.rejects(
        db.query("select public.save_member_preferences('INVALID',true,true)"),
      );
      const key = "77777777-7777-4777-8777-777777777777";
      const move = () =>
        scalar("select public.move_vault_funds('USDT',250000,'in',$1) as id", [
          key,
        ]);
      const first = await move();
      assert.deepEqual(await move(), first);
      member = await overview();
      assert.equal(
        member.wallets.find((w) => w.currency === "USDT" && w.kind === "user")
          .balance_atomic,
        "750000",
      );
      assert.equal(
        member.wallets.find((w) => w.currency === "USDT" && w.kind === "vault")
          .balance_atomic,
        "250000",
      );
      await assert.rejects(
        db.query("select public.move_vault_funds('USDT',250001,'in',$1)", [
          key,
        ]),
        /Idempotency conflict/,
      );
      await assert.rejects(
        db.query(
          "select public.move_vault_funds('USDT',250001,'out','88888888-8888-4888-8888-888888888888')",
        ),
        /Insufficient balance/,
      );
      await claims(b, sb);
      member = await overview();
      assert.equal(member.unread, 0);
      assert.equal(member.notifications.length, 0);
      assert.equal(member.preferences.currency, "USDT");
      assert.ok(member.wallets.every((w) => w.balance_atomic === "0"));
      await db.query("select public.read_member_notifications($1)", [
        notificationA,
      ]);
      await assert.rejects(
        db.query(
          "select public.move_vault_funds('USDT',1,'out','99999999-9999-4999-8999-999999999999')",
        ),
        /Insufficient balance/,
      );
      await claims(a, sa);
      assert.equal((await overview()).unread, 1);
      await db.query("select public.read_member_notifications($1)", [
        notificationA,
      ]);
      assert.equal((await overview()).unread, 0);
      await db.query(
        "select public.move_vault_funds('USDT',250000,'out','aaaaaaaa-aaaa-4aaa-8aaa-111111111111')",
      );
      assert.equal(
        (await overview()).wallets.find(
          (w) => w.currency === "USDT" && w.kind === "user",
        ).balance_atomic,
        "1000000",
      );
      await db.exec("reset role");
      assert.equal(
        (
          await scalar(
            "select sum(amount_atomic)::text as total from public.ledger_entries",
          )
        ).total,
        "0",
      );
    },
  );

  await t.test(
    "revoked sessions fail authorization and database row policies",
    async () => {
      await claims(a, sb);
      await db.exec("set role authenticated");
      assert.equal(
        (await scalar("select public.touch_user_session() as active")).active,
        true,
      );
      await claims(a, sa);
      await db.query("select public.revoke_user_sessions(false)");
      assert.equal(
        (await scalar("select public.touch_user_session() as active")).active,
        true,
      );
      await claims(a, sb);
      assert.equal(
        (await scalar("select public.touch_user_session() as active")).active,
        false,
      );
      assert.equal(
        (await db.query("select * from public.profiles")).rows.length,
        0,
      );
      assert.equal(
        (await db.query("select * from public.get_my_wallets()")).rows.length,
        0,
      );
      await claims(a, sa);
      await db.query("select public.revoke_current_session()");
      await assert.rejects(
        db.query(
          "select * from public.send_support_message(gen_random_uuid(),'test')",
        ),
        /SESSION_REQUIRED/,
      );
      assert.equal(
        (await scalar("select public.touch_user_session() as active")).active,
        false,
      );
      await db.exec("reset role");
    },
  );
  await db.close();
});
