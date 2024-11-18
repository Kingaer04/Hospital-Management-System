import React, { createContext, useContext, useState, useEffect } from 'react'

const openContext = createContext()

export const OpenProvider =({ children }) => {
    const [open, setOpen] = useState(false)
    const [mainContentWidth, setMainContentWidth] = useState('100vw')

    useEffect(() => {
        const updateWidth = () => {
          const viewportWidth = window.innerWidth;
          const width = open ? `${viewportWidth - 240}px` : '100vw';
          setMainContentWidth(width);
        };
    
        // Call the function on component mount and window resize
        updateWidth();
        window.addEventListener('resize', updateWidth);
    
        // Clean up the event listener on unmount
        return () => {
          window.removeEventListener('resize', updateWidth);
        };
      }, [open]); // Re-run effect when `open` changes
    return (
        <openContext.Provider value={{ open, setOpen, mainContentWidth }}>
            {children}
        </openContext.Provider>
    )
}

export const useOpen = () => useContext(openContext)
