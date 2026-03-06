import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutsideClick } from '../hooks/use-outside-click';

// Close Icon Component
const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

// Main Expandable Card List Component
const ExpandableCardList = ({ cards, title }) => {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const id = useState(() => Math.random().toString(36).substr(2, 9))[0];

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setActive(null);
      }
    }

    if (active && typeof active === 'object') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {active && typeof active === 'object' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-40"
          />
        )}
      </AnimatePresence>

      {/* Expanded Card Modal */}
      <AnimatePresence>
        {active && typeof active === 'object' ? (
          <div className="fixed inset-0 grid place-items-center z-50">
            <motion.button
              key={`button-${active.id || active.clubId}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-4 right-4 items-center justify-center bg-white dark:bg-neutral-800 rounded-full h-8 w-8 shadow-lg"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            
            <motion.div
              layoutId={`card-${active.id || active.clubId}-${id}`}
              ref={ref}
              className="w-full max-w-lg mx-4 h-fit max-h-[85vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Card Image/Header */}
              <motion.div 
                layoutId={`image-${active.id || active.clubId}-${id}`}
                className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center"
              >
                {active.image ? (
                  <img 
                    src={active.image} 
                    alt={active.title || active.clubName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-white/80">
                    {active.icon || (active.title || active.clubName || '🎯').charAt(0)}
                  </span>
                )}
              </motion.div>

              <div className="p-5 overflow-y-auto">
                {/* Title & Description */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${active.id || active.clubId}-${id}`}
                      className="text-xl font-bold text-neutral-800 dark:text-neutral-100"
                    >
                      {active.title || active.clubName}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.id || active.clubId}-${id}`}
                      className="text-sm text-neutral-500 dark:text-neutral-400 mt-1"
                    >
                      {active.description}
                    </motion.p>
                  </div>
                </div>

                {/* Additional Content */}
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed"
                >
                  {typeof active.content === 'function' ? active.content() : active.content}
                </motion.div>

                {/* Action Button */}
                {active.ctaText && (
                  <motion.a
                    layoutId={`button-${active.id || active.clubId}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="mt-4 inline-flex items-center justify-center px-5 py-2.5 text-sm rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    {active.ctaText}
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Card List */}
      <div className="space-y-3">
        {title && <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">{title}</h3>}
        
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.id || card.clubId}-${id}`}
            key={card.id || card.clubId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 rounded-xl cursor-pointer border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex gap-4 flex-col sm:flex-row items-center sm:items-start w-full">
              {/* Card Image/Icon */}
              <motion.div 
                layoutId={`image-${card.id || card.clubId}-${id}`}
                className="w-16 h-16 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0"
              >
                {card.image ? (
                  <img src={card.image} alt={card.title || card.clubName} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span className="text-2xl sm:text-lg">
                    {card.icon || (card.title || card.clubName || '🎯').charAt(0)}
                  </span>
                )}
              </motion.div>
              
              <div className="text-center sm:text-left flex-1">
                <motion.h3
                  layoutId={`title-${card.id || card.clubId}-${id}`}
                  className="font-semibold text-neutral-800 dark:text-neutral-100"
                >
                  {card.title || card.clubName}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.id || card.clubId}-${id}`}
                  className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
            
            <motion.button
              layoutId={`button-${card.id || card.clubId}-${id}`}
              className="mt-3 sm:mt-0 px-4 py-2 text-xs sm:text-sm rounded-full font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"
            >
              {card.ctaText || 'View Details'}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default ExpandableCardList;

