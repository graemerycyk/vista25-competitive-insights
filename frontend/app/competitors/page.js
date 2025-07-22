'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import toast from 'react-hot-toast';
import ImportantToast from '@/components/ImportantToast';

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      console.log('Fetching data from Supabase...');
      
      // Create Supabase client inside function to avoid build-time errors
      const supabase = createClient();
      
      // Fetch competitors
      console.log('Fetching competitors...');
      const { data: competitorsData, error: competitorsError } = await supabase
        .from('competitors')
        .select('*')
        .order('name');

      if (competitorsError) {
        console.error('Error fetching competitors:', competitorsError);
        setError('Failed to fetch competitors: ' + competitorsError.message);
        setLoading(false);
        return;
      }

      console.log('Competitors fetched:', competitorsData);

      // Fetch all events
      console.log('Fetching events...');
      const { data: eventsData, error: eventsError } = await supabase
        .from('competitor_events')
        .select('*')
        .order('published_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        setError('Failed to fetch events: ' + eventsError.message);
        setLoading(false);
        return;
      }

      console.log('Events fetched:', eventsData);

      setCompetitors(competitorsData || []);
      setEvents(eventsData || []);
      
      // Set first competitor as active tab if none selected
      if (!activeTab && competitorsData && competitorsData.length > 0) {
        setActiveTab(competitorsData[0].id);
      }
      
      setLastUpdated(new Date());
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Unexpected error: ' + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up polling every 60 seconds
    const interval = setInterval(fetchData, 60000);
    
    // Set up realtime subscription for important events
    const supabase = createClient();
    const channel = supabase.channel('public:competitor_events');
    
    channel.on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'competitor_events', 
        filter: 'is_important=eq.true' 
      },
      (payload) => {
        const event = payload.new;
        
        // Show custom toast for important events
        toast.custom((t) => (
          <ImportantToast 
            event={event} 
            onDismiss={() => toast.dismiss(t.id)} 
          />
        ), {
          duration: 10000, // Show for 10 seconds
          position: 'top-right',
        });
        
        // Refresh data to show the new event
        fetchData();
      }
    ).subscribe();
    
    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const getEventsForCompetitor = (competitorId) => {
    return events.filter(event => event.competitor_id === competitorId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/70">Loading competitor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-error text-xl mb-4">⚠️ Error Loading Data</div>
          <p className="text-base-content/70 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchData();
            }}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Competitor Intelligence
          </h1>
          <p className="text-base-content/70">
            Monitor competitor activities and important events in real-time.
          </p>
          {lastUpdated && (
            <p className="text-sm text-base-content/50 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {competitors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-base-content/50 mb-4">No competitors found</div>
            <div className="text-sm text-base-content/40 mb-4">
              It looks like the database tables might not be set up yet.
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  setLoading(true);
                  fetchData();
                }}
                className="btn btn-primary"
              >
                Refresh Data
              </button>
              <a 
                href="/api/scrape" 
                target="_blank"
                className="btn btn-secondary"
              >
                Run Scraper
              </a>
            </div>
          </div>
        ) : (
          <div className="tabs tabs-lifted tabs-lg mb-6">
            {competitors.map((competitor) => (
              <button
                key={competitor.id}
                className={`tab ${activeTab === competitor.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(competitor.id)}
              >
                {competitor.name}
                {competitor.ticker && (
                  <span className="ml-2 opacity-60">({competitor.ticker})</span>
                )}
                <span className="badge badge-sm badge-neutral ml-2">
                  {getEventsForCompetitor(competitor.id).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {activeTab && (
          <div className="bg-base-200 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Headline</th>
                    <th>Summary</th>
                    <th>Importance</th>
                  </tr>
                </thead>
                <tbody>
                  {getEventsForCompetitor(activeTab).map((event) => (
                    <tr key={event.id} className="hover">
                      <td className="whitespace-nowrap text-sm">
                        {formatDate(event.published_at)}
                      </td>
                      <td>
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary font-medium hover:link-accent"
                        >
                          {event.headline}
                        </a>
                      </td>
                      <td className="max-w-md">
                        <div className="line-clamp-2 text-sm text-base-content/80">
                          {event.summary || 'No summary available'}
                        </div>
                      </td>
                      <td>
                        {event.is_important ? (
                          <div className="badge badge-error text-white">
                            Important
                          </div>
                        ) : (
                          <div className="badge badge-ghost">Normal</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {getEventsForCompetitor(activeTab).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-base-content/50 mb-4">
                    No events found for {competitors.find(c => c.id === activeTab)?.name}
                  </div>
                  <div className="text-sm text-base-content/40 mb-4">
                    Run the scraper to fetch news articles for this competitor.
                  </div>
                  <a 
                    href="/api/scrape" 
                    target="_blank"
                    className="btn btn-primary btn-sm"
                  >
                    Run Scraper
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 