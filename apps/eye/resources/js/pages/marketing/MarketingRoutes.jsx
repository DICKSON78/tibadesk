import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import DailyActivities from "./daily-activities/DailyActivities";
import Ideas from "./ideas/Ideas";
import ResearchPlans from "./research-plans/ResearchPlans";
import MarketingStrategies from "./marketing-strategies/MarketingStrategies";
import Events from "./events/Events";
import CommunicationLogs from "./communication-logs/CommunicationLogs";
import SettingsRoutes from "./settings/SettingsRoutes";
import BlogPostList from "./blog/BlogPostList";
import BlogPostForm from "./blog/BlogPostForm";
import BlogPostView from "./blog/BlogPostView";
import AnnouncementList from "./announcements/AnnouncementList";
import AnnouncementForm from "./announcements/AnnouncementForm";
import ReportsRoutes from "./reports/ReportsRoutes";

const MarketingRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/daily-activities"
        element={<DailyActivities />}
      />
      <Route
        path="/idea-development"
        element={<Ideas />}
      />
      <Route
        path="/research-plans"
        element={<ResearchPlans />}
      />
      <Route
        path="/strategies"
        element={<MarketingStrategies />}
      />
      <Route
        path="/events"
        element={<Events eventType="Event" />}
      />
      <Route
        path="/appointments"
        element={<Events eventType="Appointment" />}
      />
      <Route
        path="/outreach-programmes"
        element={<Events eventType="Outreach Programme" />}
      />
      <Route
        path="/communication-logs"
        element={<CommunicationLogs />}
      />
      <Route
        path="/blog"
        element={<BlogPostList />}
      />
      <Route
        path="/blog/create"
        element={<BlogPostForm />}
      />
      <Route
        path="/blog/:id"
        element={<BlogPostView />}
      />
      <Route
        path="/blog/:id/edit"
        element={<BlogPostForm />}
      />
      <Route
        path="/announcements"
        element={<AnnouncementList />}
      />
      <Route
        path="/announcements/create"
        element={<AnnouncementForm />}
      />
      <Route
        path="/announcements/:id/edit"
        element={<AnnouncementForm />}
      />
      <Route
        path="/settings/*"
        element={<SettingsRoutes />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default MarketingRoutes;
