import React from "react";

interface Mosque {
  id: number;
  name: string;
  nameAr: string;
  lat: number;
  lon: number;
  distance: number;
  address: string;
}

export interface MosqueMapViewProps {
  mosques: Mosque[];
  userLat: number;
  userLon: number;
  colors: any;
  bottomPad: number;
}

declare const MosqueMapView: React.FC<MosqueMapViewProps>;
export default MosqueMapView;
