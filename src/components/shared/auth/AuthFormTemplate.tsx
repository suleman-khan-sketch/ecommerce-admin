type Props = {
  children: React.ReactNode;
};

export default function AuthFormTemplate({ children }: Props) {
  return (
    <section>
      <div className="p-6 min-h-dvh flex items-center">
        <div className="bg-popover w-full max-w-md lg:max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-lg shadow-xl">
          <div className="relative min-h-[16rem] md:min-h-[18rem] lg:min-h-[28rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/10 text-6xl font-bold">ADMIN</div>
            </div>
          </div>

          <div className="p-6 md:p-12 flex items-center">{children}</div>
        </div>
      </div>
    </section>
  );
}
