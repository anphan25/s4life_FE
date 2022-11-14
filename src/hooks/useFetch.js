import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

const useCallbackRef = (callback) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  return callbackRef;
};

export default function useFetch({ apiHandler }) {
  const [data, setData] = useState(null);

  //   const savedOnSuccess = useCallbackRef(onSuccess);

  const fetchData = async () => {
    let isCancelled = false;
    const data = await apiHandler();

    if (!isCancelled) {
      //   savedOnSuccess.current?.(data);
      setData(data);
    }

    return () => {
      isCancelled = true;
    };
  };

  useEffect(() => {
    fetchData();
  }, [apiHandler]);
  return { data };
}
