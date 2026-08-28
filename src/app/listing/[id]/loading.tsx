export default function Loading() {
  return (
    <div className="container-q py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-9 w-44" />
          <div className="skeleton aspect-[16/9] w-full rounded-2xl" />
          <div className="skeleton h-24 w-full rounded-2xl" />
          <div className="space-y-2 pt-4">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        </div>
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
