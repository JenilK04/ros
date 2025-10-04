import axios from 'axios';
import dotenv from 'dotenv';
import Property from '../models/Property.js';
dotenv.config();
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY; // use your read-only key here

export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const response = await axios.get(
      `https://app.posthog.com/api/projects/225220/events/?limit=1000`,
      { headers: { Authorization: `Bearer ${POSTHOG_API_KEY}` } }
    );

    const events = response.data.results;

    const filteredEvents = events.filter((event) => {
      const eventDate = event.timestamp.split("T")[0];
      const dateMatch = startDate && endDate ? eventDate >= startDate && eventDate <= endDate : true;
      const userMatch = userId && userId !== "all" ? event.properties?.distinct_id === userId : true;
      return dateMatch && userMatch;
    });

    const analyticsMap = {};
    filteredEvents.forEach((event) => {
      const date = event.timestamp.split("T")[0];
      if (!analyticsMap[date]) analyticsMap[date] = { date, logins: 0, failedLogins: 0 };
      if (event.event === "login_success") analyticsMap[date].logins += 1;
      if (event.event === "login_failed") analyticsMap[date].failedLogins += 1;
    });

    const analyticsArray = Object.values(analyticsMap).sort((a, b) => a.date.localeCompare(b.date));
    res.json(analyticsArray);

  } catch (err) {
    console.error("PostHog fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

export const pageViewsAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const response = await axios.get(
      "https://app.posthog.com/api/projects/225220/events/",
      {
        headers: { Authorization: `Bearer ${POSTHOG_API_KEY}` },
        params: { event: "$pageview" },
      }
    );

    const events = response.data.results;

    const filteredEvents = events.filter((event) => {
      const eventDate = event.timestamp.split("T")[0];
      const dateMatch = startDate && endDate ? eventDate >= startDate && eventDate <= endDate : true;
      const userMatch = userId && userId !== "all" ? event.properties?.distinct_id === userId : true;
      return dateMatch && userMatch;
    });

    const pageCounts = {};
    filteredEvents.forEach((event) => {
      const page = event.properties?.$current_url || "Home";
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });

    const result = Object.keys(pageCounts).map((page) => ({
      page,
      users: pageCounts[page],
    }));

    res.json(result);
  } catch (err) {
    console.error("PostHog fetch error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to fetch page views analytics" });
  }
};
export const getPropertyViewStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query; // get from frontend

    const userProperties = await Property.find({ userId }).select('_id title');
    if (!userProperties.length) return res.json([]);

    const propertyMap = {};
    const propertyIds = userProperties.map((p) => {
      propertyMap[p._id] = p.title;
      return p._id.toString();
    });

    const eventsResponse = await axios.get(
      'https://app.posthog.com/api/projects/225220/events/',
      {
        headers: { Authorization: `Bearer ${POSTHOG_API_KEY}` },
        params: { event: 'property_view', limit: 5000 },
      }
    );

    const events = eventsResponse.data.results;

    // --- Filter by user's properties AND date range ---
    const counts = {};
    events.forEach((evt) => {
      const pageUrl = evt.properties?.$current_url || '';
      let path = '';
      try {
        path = new URL(pageUrl).pathname;
      } catch {
        path = pageUrl;
      }

      const matchedProperty = userProperties.find(
        (p) => path === `/properties/${p._id}`
      );

      const viewerId = evt.distinct_id;
      const eventDate = evt.timestamp.split("T")[0];

      const dateMatch = startDate && endDate ? eventDate >= startDate && eventDate <= endDate : true;

      if (matchedProperty && viewerId && viewerId !== userId.toString() && dateMatch) {
        counts[matchedProperty._id] = counts[matchedProperty._id] || new Set();
        counts[matchedProperty._id].add(viewerId);
      }
    });

    const stats = userProperties.map((p) => ({
      propertyName: propertyMap[p._id],
      views: counts[p._id] ? counts[p._id].size : 0,
    }));

    res.json(stats);
  } catch (err) {
    console.error('Failed to fetch property stats:', err.response?.data || err.message);
    res.status(500).json({ msg: 'Failed to fetch property stats' });
  }
};

export const userActivity = async (req, res) => {
  const { userId } = req.params;

  try {
    const response = await axios.get(
      `https://app.posthog.com/api/projects/225220/events/`,
      {
        headers: {
          Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
        },
        params: {
          distinct_id: userId,
          limit: 100,
        },
      }
    );

    const pageViews = (response.data.results || []).filter(
      (event) => event.event === '$pageview'
    );

    res.json(pageViews);
  } catch (err) {
    console.error(
      "Error fetching user page activity from PostHog:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Failed to fetch user page activity" });
  }
};
