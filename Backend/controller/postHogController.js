import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY; // use your read-only key here

export const getAnalytics = async (req, res) => {
  try {
    // PostHog API key (read-only key)

    // Fetch events from PostHog
    const response = await axios.get(
      `https://app.posthog.com/api/projects/225220/events/?limit=1000`,
      {
        headers: {
          Authorization: `Bearer ${POSTHOG_API_KEY}`,
        },
      }
    );

    const events = response.data.results;

    // Aggregate by date
    const analyticsMap = {};

    events.forEach((event) => {
      const date = event.timestamp.split('T')[0]; // YYYY-MM-DD

      if (!analyticsMap[date]) {
        analyticsMap[date] = { date, logins: 0, failedLogins: 0 };
      }

      if (event.event === 'login_success') {
        analyticsMap[date].logins += 1;
      }

      if (event.event === 'login_failed') {
        analyticsMap[date].failedLogins += 1;
      }
    });

    const analyticsArray = Object.values(analyticsMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    res.json(analyticsArray);
  } catch (err) {
    console.error('PostHog fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const pageViewsAnalytics = async (req, res) => {
  try {
    const response = await axios.get('https://app.posthog.com/api/projects/225220/events/', {
       headers: {
          Authorization: `Bearer ${POSTHOG_API_KEY}`,
        },
      params: {
        event: '$pageview'
      },
    });

    // Transform PostHog data
    const pageCounts = {};
    response.data.results.forEach((event) => {
      const page = event.properties?.$current_url || 'unknown';
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });

    const result = Object.keys(pageCounts).map((page) => ({
      page,
      users: pageCounts[page],
    }));

    res.json(result);
  } catch (err) {
    console.error('PostHog fetch error:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch page views analytics' });
  }
};