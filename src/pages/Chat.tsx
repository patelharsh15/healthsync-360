import { HealthChat } from "@/components/HealthChat";
import { HistoryList } from "@/components/HistoryList";

const Chat = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Health Assistant</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <HealthChat />
        <HistoryList />
      </div>
    </div>
  );
};

export default Chat;