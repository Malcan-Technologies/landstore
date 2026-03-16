import NotificationList from "@/components/userDashboard/notifications/NotificationList";
import { fullNotificationItems } from "@/components/userDashboard/notifications/notificationData";

const NotificationsPage = () => {
  return (
    <main className="bg-background-primary py-10">
      <div className="mx-auto w-full max-w-245 px-4 md:px-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[40px] font-semibold tracking-tight text-gray2">Notifications</h1>
            <p className="mt-1 text-[18px] text-gray5">Stay updated on your listings and enquiries</p>
          </div>
          <button type="button" className="mt-4 text-[15px] font-medium text-green-primary transition hover:text-green-secondary">
            Clear all
          </button>
        </header>

        <NotificationList notifications={fullNotificationItems} />
      </div>
    </main>
  );
};

export default NotificationsPage;
