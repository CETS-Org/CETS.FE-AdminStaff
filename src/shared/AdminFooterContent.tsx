// src/shared/AdminFooterContent.tsx

export default function AdminFooterContent() {
  return (
    <>
      <h2 className="font-semibold text-white mb-2 text-sm">System Status</h2>
      <div className="flex flex-col gap-2">
        <div className="rounded-lg p-2 bg-white/10 border border-white/20">
          <h3 className="text-xs font-semibold text-white">Server Status</h3>
          <p className="text-[11px] text-green-400">Online - All systems operational</p>
        </div>
        <div className="rounded-lg p-2 bg-white/10 border border-white/20">
          <h3 className="text-xs font-semibold text-white">Active Users</h3>
          <p className="text-[11px] text-white/70">247 users online</p>
        </div>
      </div>
    </>
  );
}
