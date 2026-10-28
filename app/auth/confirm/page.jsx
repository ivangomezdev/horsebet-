import ConfirmEmail from "../../../components/auth/ConfirmEmail";
export const metadata = { title: "Confirmar acceso — HorseBet" };
export default async function ConfirmPage({ searchParams }) {
  const params = await searchParams;
  return (
    <ConfirmEmail
      tokenHash={typeof params.token_hash === "string" ? params.token_hash : ""}
      type={typeof params.type === "string" ? params.type : ""}
    />
  );
}
