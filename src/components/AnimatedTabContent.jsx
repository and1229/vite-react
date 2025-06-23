import React, { useState, useEffect, useRef } from 'react';

export function AnimatedTabContent({ 
  activeTab, 
  children, 
  darkMode,
  animationType = 'slide' // 'slide', 'fade', 'scale'
}) {
  const [prevTab, setPrevTab] = useState(activeTab);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('right');
  const timeoutRef = useRef(null);

  const tabOrder = ['calculator', 'schedule', 'analytics', 'goals'];

  useEffect(() => {
    if (activeTab !== prevTab) {
      const currentIndex = tabOrder.indexOf(activeTab);
      const prevIndex = tabOrder.indexOf(prevTab);
      
      setAnimationDirection(currentIndex > prevIndex ? 'right' : 'left');
      setIsAnimating(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        setPrevTab(activeTab);
      }, 400);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTab, prevTab]);

  const getAnimationClass = (child) => {
    const tabId = child.props['data-tab'];

    if (isAnimating) {
      if (tabId === activeTab) {
        if (animationType === 'slide') {
          return `tab-content active tab-slide-in-${animationDirection}`;
        }
        return 'tab-content active tab-fade-in-scale';
      }
      if (tabId === prevTab) {
        if (animationType === 'slide') {
          const outDirection = animationDirection === 'right' ? 'left' : 'right';
          return `tab-content active tab-slide-out-${outDirection}`;
        }
        return 'tab-content active tab-fade-out-scale';
      }
    }

    return tabId === activeTab ? 'tab-content active' : 'tab-content inactive';
  };
  
  const renderedChildren = children.map(child => {
    const tabId = child.props['data-tab'];
    if (isAnimating || tabId === activeTab) {
      return React.cloneElement(child, {
        className: `${child.props.className || ''} ${getAnimationClass(child)}`,
        key: tabId,
      });
    }
    return null;
  });

  return (
    <div className="tab-container">
      {renderedChildren}
    </div>
  );
} 