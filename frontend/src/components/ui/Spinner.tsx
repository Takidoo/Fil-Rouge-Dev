interface SpinnerProps {
  size?: number;
}

export function Spinner({ size }: SpinnerProps) {
  const style = size ? { width: size, height: size, borderWidth: 2 } : undefined;
  return <span className="spinner" style={style} />;
}
