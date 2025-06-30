import { useEffect } from 'react';

const DisableEscape = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27 ) {
        e.preventDefault();
        e.keyCode = 0
        e.returnValue = false;
        e.stopImmediatePropagation(); // 👈 more aggressive
        console.log('Escape key blocked!');
        return false;
      }
    };

    window.addEventListener('onkeydown', handleKeyDown, true); // true = capture phase

    return () => {
      window.removeEventListener('onkeydown', handleKeyDown, true);
    };
  }, []);

  return null;
};

export default DisableEscape;
