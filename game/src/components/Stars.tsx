interface Props {
  count: number;
}

export function Stars({ count }: Props) {
  return (
    <div
      className="text-3xl tracking-widest text-warning"
      role="img"
      aria-label={`${count} out of 3 stars`}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true">
          {i < count ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}
