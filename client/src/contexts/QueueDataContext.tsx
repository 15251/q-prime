import { QueueData } from '../../../types/QueueData';
import React, { createContext, useEffect, useState } from 'react';
import HomeService from '../services/HomeService';
import {
  ensureSocketConnected,
  socketSubscribeTo,
} from '../services/SocketsService';

/**
 * Context object for queue data
 *
 * This context will be loaded for all users
 *
 * This context is updated via the `queueData` socket
 */
const QueueDataContext = createContext({
  queueData: {} as QueueData,
  setQueueData: ((queueData: QueueData) => {}) as React.Dispatch<
    React.SetStateAction<QueueData>
  >,
});

/**
 * Sort topics alphabetically by name (case-insensitive).
 * @param {QueueData} data Queue data to normalize
 * @return {QueueData} Queue data with sorted topics
 */
const withSortedTopics = (data: QueueData): QueueData => ({
  ...data,
  topics: [...(data.topics ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}),
  ),
});

/**
 * Context provider for queue data
 * @return {React.Provider} Context provider for queue data
 */
const QueueDataContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [queueData, setQueueDataState] = useState<QueueData>({
    title: 'Office Hours Queue',
    ownerEmail: '',
    uninitializedSem: false,
    queueFrozen: true,
    allowCDOverride: true,
    allowShowOthersTimer: false,

    numStudents: 0,
    rejoinTime: 15,
    numUnhelped: 0,
    minsPerStudent: 0,
    numTAs: 0,

    announcements: [],
    questionsURL: '',
    topics: [],
    locations: {
      dayDictionary: {},
      roomDictionary: {},
    },

    tas: [],
  });

  const setQueueData: React.Dispatch<React.SetStateAction<QueueData>> = (
      value,
  ) => {
    setQueueDataState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      return withSortedTopics(next);
    });
  };

  // Load queue data and subscribe to changes
  useEffect(() => {
    HomeService.getAll().then((res) => {
      setQueueData(res.data);
      document.title = res.data.title;
    });

    socketSubscribeTo('queueData', (data: QueueData) => {
      setQueueData(data);
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        HomeService.getAll().then((res) => {
          setQueueData(res.data);
        });
        ensureSocketConnected();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <QueueDataContext.Provider value={{ queueData, setQueueData }}>
      {children}
    </QueueDataContext.Provider>
  );
};

export { QueueDataContext, QueueDataContextProvider };
