import { useRef, useCallback } from "react";
import { DeviceEventEmitter } from "react-native";

// Screens broadcast scroll direction; FloatingTabBar listens and slides
// itself away (scroll down) or back in (scroll up).
export const TABBAR_VISIBILITY_EVENT = "tabbar:visibility";

// Cumulative scroll distance (px) required before toggling. Showing needs a
// longer, deliberate upward scroll so small flicks and rebounds don't flash
// the bar back in.
const HIDE_DISTANCE = 30;
const SHOW_DISTANCE = 70;
// Zone above the end of content where direction changes are ignored — the
// bottom overscroll bounce produces a fake "scroll up" that must not reveal
// the bar.
const BOTTOM_GUARD = 80;

export const setTabBarVisible = (visible) => {
  DeviceEventEmitter.emit(TABBAR_VISIBILITY_EVENT, visible);
};

/**
 * Returns an onScroll handler for FlatList/ScrollView/SectionList.
 * Attach with scrollEventThrottle={16}. Scrolling down hides the tab bar,
 * a deliberate scroll up (or reaching the top) shows it again.
 */
export const useTabBarScrollHandler = () => {
  const lastOffsetY = useRef(0);
  const accumulated = useRef(0);
  const visibleRef = useRef(true);

  return useCallback((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const y = contentOffset.y;

    // At (or overscrolled past) the top the bar must always be visible.
    if (y <= 0) {
      if (!visibleRef.current) {
        visibleRef.current = true;
        setTabBarVisible(true);
      }
      lastOffsetY.current = 0;
      accumulated.current = 0;
      return;
    }

    // Inside the bottom bounce zone: track position but ignore direction,
    // so the rebound never re-shows the bar.
    const maxOffset = contentSize.height - layoutMeasurement.height;
    if (maxOffset > 0 && y >= maxOffset - BOTTOM_GUARD) {
      lastOffsetY.current = y;
      accumulated.current = 0;
      return;
    }

    const delta = y - lastOffsetY.current;
    lastOffsetY.current = y;

    // Reset the streak when the direction flips.
    if ((delta > 0 && accumulated.current < 0) || (delta < 0 && accumulated.current > 0)) {
      accumulated.current = 0;
    }
    accumulated.current += delta;

    if (accumulated.current > HIDE_DISTANCE && visibleRef.current) {
      visibleRef.current = false;
      accumulated.current = 0;
      setTabBarVisible(false);
    } else if (accumulated.current < -SHOW_DISTANCE && !visibleRef.current) {
      visibleRef.current = true;
      accumulated.current = 0;
      setTabBarVisible(true);
    }
  }, []);
};
