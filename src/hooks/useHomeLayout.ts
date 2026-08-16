import { useState, useEffect, useCallback } from 'react';
import { getHomeLayout, saveHomeLayout, getStatsLayout, saveStatsLayout } from '../services/storage';
import { DEFAULT_HOME_ORDER, DEFAULT_STATS_ORDER } from '../types/homeLayoutTypes';
import type { HomeCardId, StatCardId } from '../types/homeLayoutTypes';

export function useHomeLayout() {
  const [isReordering, setIsReordering] = useState(false);
  const [homeOrder, setHomeOrder] = useState<HomeCardId[]>(DEFAULT_HOME_ORDER);
  const [statsOrder, setStatsOrder] = useState<StatCardId[]>(DEFAULT_STATS_ORDER);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const hOrder = await getHomeLayout();
      // Ensure we have exactly the right amount of items, in case we add new ones later
      if (hOrder && hOrder.length === DEFAULT_HOME_ORDER.length) {
        setHomeOrder(hOrder);
      }
      
      const sOrder = await getStatsLayout();
      if (sOrder && sOrder.length === DEFAULT_STATS_ORDER.length) {
        setStatsOrder(sOrder);
      }
      
      setIsLoaded(true);
    }
    load();
  }, []);

  const enterReorderMode = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setIsReordering(true);
  }, []);

  const exitReorderMode = useCallback(() => {
    setIsReordering(false);
    // Save to IDB when user confirms
    saveHomeLayout(homeOrder);
    saveStatsLayout(statsOrder);
  }, [homeOrder, statsOrder]);

  const resetOrder = useCallback(() => {
    setHomeOrder(DEFAULT_HOME_ORDER);
    setStatsOrder(DEFAULT_STATS_ORDER);
    saveHomeLayout(DEFAULT_HOME_ORDER);
    saveStatsLayout(DEFAULT_STATS_ORDER);
    setIsReordering(false);
  }, []);

  return {
    isLoaded,
    isReordering,
    enterReorderMode,
    exitReorderMode,
    resetOrder,
    homeOrder,
    setHomeOrder,
    statsOrder,
    setStatsOrder
  };
}
