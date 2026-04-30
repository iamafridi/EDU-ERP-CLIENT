import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function GlobalLoading() {
  return (
    <LoadingScreen
      title="MEDCAMPUS OS"
      subtitle="Unified Medical College & University ERP"
      variant="full"
      showProgress={true}
    />
  );
}
