import React, { useState, useEffect } from "react";
import axios from "axios";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const NotificationButton = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [publicVapidKey, setPublicVapidKey] = useState("");

  const fetchVapidKey = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/notifications/vapid-public-key"
      );
      setPublicVapidKey(response.data);
    } catch (error) {
      console.error("Error fetching VAPID key:", error);
    }
  };

  useEffect(() => {
    fetchVapidKey();
  }, []);

  const handleEnableNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      setPermissionGranted(true);
      await subscribeToPushNotifications();
    } else {
      console.log("Notification permission denied.");
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js"
        );
        console.log("Service Worker registered with scope:", registration.scope);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        await axios.post("http://localhost:3000/notifications", subscription);
        console.log("Push subscription successful:", subscription);
      }
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
    }
  };

  const handleSendNotification = async () => {
    try {
      await axios.post("http://localhost:3000/notifications/send-notification", {
        title: "MLP Notification",
        body: "MW-1234 was modified.",
      });
      console.log("Notification sent successfully.");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <div>
      <button onClick={handleEnableNotifications}>Allow Notifications</button>
      {permissionGranted && (
        <button onClick={handleSendNotification}>Send Notification</button>
      )}
    </div>
  );
};

export default NotificationButton;
