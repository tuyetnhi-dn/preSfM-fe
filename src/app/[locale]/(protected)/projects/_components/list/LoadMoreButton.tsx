type Props = {
  hasNextPage?: boolean;
  isFetching?: boolean;
  onClick: () => void;
};

export function LoadMoreButton({ hasNextPage, isFetching, onClick }: Props) {
  if (!hasNextPage) {
    return null;
  }

  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        disabled={isFetching}
        onClick={onClick}
        className="rounded-xl border px-4 py-2 text-sm"
      >
        {isFetching ? "Đang tải..." : "Xem thêm"}
      </button>
    </div>
  );
}
