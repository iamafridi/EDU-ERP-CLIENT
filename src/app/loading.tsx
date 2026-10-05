import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function GlobalLoading() {
  return (
    <LoadingScreen
      title="HOSTEL-PRO ERP"
      subtitle="Advanced Campus, Living & Enterprise Operations System"
      variant="full"
      showProgress={true}
    />
  );
}
