import { useEffect, useRef } from 'react';
import axios from 'axios';
import { API_CONNECTION_HOST_URL } from '../utils/constant';

let beaconInitialized = false;
let beaconScriptLoaded = false;

export default function useHelpScout(beaconId, options = {}, enabled = true) {
  const { customAttributes = {} } = options;
  const initRef = useRef(false);
  const cleanupFunctionsRef = useRef([]);

  useEffect(() => {
    if (!beaconId || !enabled) {
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(beaconId)) {
      return;
    }

    if (beaconInitialized || beaconScriptLoaded) {
      return;
    }
    
    beaconScriptLoaded = true;
    initRef.current = true;

    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://beacon-v2.helpscout.net";
    document.head.appendChild(preconnect1);
    cleanupFunctionsRef.current.push(() => {
      if (preconnect1.parentNode) preconnect1.parentNode.removeChild(preconnect1);
    });

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://beaconapi.helpscout.net";
    document.head.appendChild(preconnect2);
    cleanupFunctionsRef.current.push(() => {
      if (preconnect2.parentNode) preconnect2.parentNode.removeChild(preconnect2);
    });

    if (!window.Beacon) {
      window.Beacon = function (...args) {
        (window.Beacon.readyQueue = window.Beacon.readyQueue || []).push(args);
      };
      window.Beacon.readyQueue = [];
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://beacon-v2.helpscout.net";
    
    script.onload = () => {
      setTimeout(() => {
        initializeBeacon(beaconId, customAttributes);
      }, 100);
    };
    
    script.onerror = () => {};
    
    document.head.appendChild(script);
    cleanupFunctionsRef.current.push(() => {
      if (script.parentNode) script.parentNode.removeChild(script);
    });

    return () => {
      try {
        if (window.Beacon && typeof window.Beacon === 'function') {
          window.Beacon("destroy");
        }
      } catch (e) {}

      cleanupFunctionsRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (e) {}
      });

      document.querySelectorAll('script[src*="beacon-v2.helpscout.net"]')
        .forEach((el) => el.parentNode && el.parentNode.removeChild(el));
      
      document.querySelectorAll('link[href*="beacon"]')
        .forEach((el) => el.parentNode && el.parentNode.removeChild(el));

      try {
        delete window.Beacon;
      } catch (e) {
        window.Beacon = undefined;
      }
      
      beaconInitialized = false;
      beaconScriptLoaded = false;
      initRef.current = false;
    };
  }, [beaconId, enabled]);

  useEffect(() => {
    if (beaconInitialized && window.Beacon && typeof window.Beacon === 'function') {
      setTimeout(() => {
        identifyUser(customAttributes);
      }, 500);
    }
  }, [JSON.stringify(customAttributes)]);
}

function initializeBeacon(beaconId, customAttributes) {
  if (!window.Beacon || typeof window.Beacon !== 'function') {
    return;
  }

  try {
    window.Beacon("on", "error", () => {});
    window.Beacon("on", "ready", () => {});
    window.Beacon("on", "open", () => {});
    window.Beacon("on", "close", () => {});

    window.Beacon("init", beaconId);

    window.Beacon("config", {
      color: "#FF6B35",
      icon: "message",
      zIndex: 999999,
      enableFab: true,
      messagingEnabled: true,
      docsEnabled: false,
      topArticles: false,
      poweredBy: false
    });

    beaconInitialized = true;

    window.Beacon("once", "ready", () => {});

    setTimeout(() => {
      identifyUser(customAttributes);
    }, 500);

  } catch (error) {}
}

async function identifyUser(customAttributes) {
  if (!window.Beacon || typeof window.Beacon !== 'function') {
    return;
  }

  try {
    const userData = localStorage.getItem("user");
    if (!userData) {
      return;
    }

    let parsedUserData;
    try {
      parsedUserData = JSON.parse(userData);
    } catch (err) {
      return;
    }

    const token = parsedUserData?.accessToken;
    if (!token) {
      return;
    }

    const apiUrl = `${API_CONNECTION_HOST_URL}/user`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const apiUser = response.data?.data?.user || response.data?.user || response.data;

    if (!apiUser?.email) {
      return;
    }

    const identifyPayload = {
      name: apiUser.name || apiUser.email,
      email: apiUser.email,
      ...customAttributes
    };

    if (apiUser._id || apiUser.id) {
      identifyPayload.userId = String(apiUser._id || apiUser.id);
    }

    window.Beacon("identify", identifyPayload);

  } catch (error) {}
}
