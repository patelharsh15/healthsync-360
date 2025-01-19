import { HealthChat } from "@/components/HealthChat";

const Chat = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Health Assistant</h2>
      <HealthChat />
    </div>
  );
}

export default Chat;