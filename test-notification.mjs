import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient("https://hearty-chicken-782.convex.cloud");

async function testNotification() {
  try {
    console.log("Testing Convex notification system...");
    
    // Send a test notification
    const result = await client.mutation("notifications:send", {
      userId: "test-user-123",
      title: "Test Notification",
      message: "This is a test notification to verify Convex is working!",
      type: "admin_message",
      link: "/home"
    });
    
    console.log("✅ Notification created successfully!");
    console.log("Notification ID:", result);
    
    // Query notifications for the test user
    const notifications = await client.query("notifications:getForUser", {
      userId: "test-user-123"
    });
    
    console.log("\n📬 Notifications for test-user-123:");
    console.log(JSON.stringify(notifications, null, 2));
    
    // Get unread count
    const unreadCount = await client.query("notifications:getUnreadCount", {
      userId: "test-user-123"
    });
    
    console.log("\n🔔 Unread count:", unreadCount);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testNotification();
