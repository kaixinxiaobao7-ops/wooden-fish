export interface ToastItem {
  id: number;
  kind: 'achievement' | 'info';
  title: string;
  desc?: string;
  char?: string;
}

interface ToastsProps {
  items: ToastItem[];
  onDismiss: (id: number) => void;
}

export function Toasts({ items, onDismiss }: ToastsProps) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {items.map((item) => (
        <div
          key={item.id}
          className={`toast toast--${item.kind}`}
          role="status"
          onClick={() => onDismiss(item.id)}
        >
          <span className="toast-seal" aria-hidden="true">
            {item.char ?? '◈'}
          </span>
          <span className="toast-text">
            <strong>{item.title}</strong>
            {item.desc ? <small>{item.desc}</small> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
