export default function CurrencyIcon({ code, size = 20 }) {
  return (
    <img
      className="currency-icon"
      src={"/currencies/" + code.toLowerCase() + ".svg"}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
