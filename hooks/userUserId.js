import { useState, useEffect } from 'react';

const useUserId = () => {
  const [userId, setUserId] = useState(null); 

  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    console.log(userId);
  }, [userId]);


  return {userId, setUserId};
};

export default useUserId;
