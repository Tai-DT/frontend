declare global {
    interface Window {
      goongjs: {
        accessToken: string;
        Map: new (options: {
          container: string;
          style: string;
          center: [number, number];
          zoom: number;
        }) => GoongMap;
        Marker: new () => GoongMarker;
      };
    }
  
    interface GoongMap {
      on(event: string, callback: (e: { lngLat: Location }) => void): void;
      flyTo(options: { center: [number, number]; zoom: number }): void;
    }
  
    interface GoongMarker {
      setLngLat(lngLat: [number, number]): this;
      addTo(map: GoongMap): this;
    }
  }
  
  export {};
  