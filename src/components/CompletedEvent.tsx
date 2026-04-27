import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { EventCard } from './EventCard';
import './CompletedEvent.css';

// import { createEventUrl } from '../api/codeMapping';

// interface EventItem {
//   id: string;
//   chapter_id: string;
//   chapter: string;
//   code: string;
//   name: string;
//   dates: string;
//   time: string;
//   desc: string;
//   image: string;
//   fee: number;
//   minimum_participants: string;
//   type: number;
//   type_desc: string;
//   done: number;
//   done_desc: string;
// }

interface CompletedEventProps {
  className?: string;
}



export const CompletedEvent: React.FC<CompletedEventProps> = ({ className }) => {
  // Move ALL hooks to the top, before any conditional logic

  // const navigate = useNavigate();

  useEffect(() => {
    // eventMutation.mutate({ limit: 10, offset: 0 }); // Fetch front events with only limit and offset
  }, []);


  // Ambil hasil eventMutation.data.content.result sebagai completedEvents
  // const completedEvents: EventItem[] = eventMutation.data?.content?.result ?? [];

//  const handleEventClick = (event: EventItem) => {
//     // Create SEO-friendly URL with ID and code slug
//     const eventUrl = createEventUrl(event.id, event.code);
//     navigate(eventUrl);
//   };


  // Now do conditional rendering AFTER all hooks have been called
  // if (!eventMutation.data?.content?.result || completedEvents.length === 0) {
  //   return null;
  // }



  return (
    <div className={`completed-event ${className || ''}`}>
      <div className="event-scroll-container">
        {/* {completedEvents.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            image={event.image}
            title={event.code}
            date={event.dates}
            chapter={event.chapter}
            type={event.type_desc}
            event={event}
            onClick={handleEventClick}
          />
        ))} */}
      </div>
    
    </div>
  );
};
