import type { KeyToken } from "./copy";

type Size = "sm" | "md" | "lg";
type Tone = "light" | "dark";

export function keyLabel(token: KeyToken, mac: boolean): string {
  switch (token) {
    case "mod":
      return mac ? "⌘" : "Ctrl";
    case "shift":
      return mac ? "⇧" : "Shift";
    case "space":
      return "Space";
    case "enter":
      return "↵";
    case "tab":
      return "Tab";
    case "esc":
      return "Esc";
    case "comma":
      return ",";
    case "digits":
      return "1-5";
    default:
      return token.toUpperCase();
  }
}

function spokenLabel(token: KeyToken, mac: boolean): string {
  switch (token) {
    case "mod":
      return mac ? "Cmd" : "Ctrl";
    case "enter":
      return "Enter";
    case "shift":
      return "Shift";
    default:
      return keyLabel(token, mac);
  }
}

type KeycapProps = {
  token: KeyToken;
  mac: boolean;
  size?: Size;
  tone?: Tone;
  down?: boolean;
  lit?: boolean;
};

export function Keycap({ token, mac, size = "md", tone = "light", down = false, lit = false }: KeycapProps) {
  const classes = [
    "keycap",
    `keycap-${size}`,
    `keycap-${tone}`,
    token === "space" ? "keycap-wide" : "",
    down ? "is-down" : "",
    lit ? "is-lit" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <kbd className={classes}>{keyLabel(token, mac)}</kbd>;
}

type ComboProps = {
  tokens: KeyToken[];
  mac: boolean;
  size?: Size;
  tone?: Tone;
  pressed?: ReadonlySet<KeyToken>;
  lit?: boolean;
};

export function Combo({ tokens, mac, size, tone, pressed, lit }: ComboProps) {
  return (
    <span className="combo">
      <span className="sr-only">{tokens.map((token) => spokenLabel(token, mac)).join(" + ")}</span>
      <span aria-hidden="true" className="combo-keys">
        {tokens.map((token) => (
          <Keycap down={pressed?.has(token)} key={token} lit={lit} mac={mac} size={size} token={token} tone={tone} />
        ))}
      </span>
    </span>
  );
}
