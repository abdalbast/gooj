interface Store {
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
}

const stores: Store[] = [
  {
    name: "GOOJ Clerkenwell",
    address: "42 Clerkenwell Road, London, EC1M 5PS",
    phone: "+44 20 7946 0958",
    hours: "Mon-Sat: 10AM-8PM, Sun: 12PM-6PM",
    lat: 51.5237,
    lng: -0.1068,
  },
  {
    name: "GOOJ Covent Garden",
    address: "33 Floral Street, London, WC2E 9DP",
    phone: "+44 20 7340 9002",
    hours: "Mon-Sat: 10AM-8PM, Sun: 12PM-6PM",
    lat: 51.5129,
    lng: -0.1236,
  },
  {
    name: "GOOJ Notting Hill",
    address: "178 Westbourne Grove, London, W11 2RH",
    phone: "+44 20 7727 1160",
    hours: "Mon-Sat: 11AM-8PM, Sun: 12PM-7PM",
    lat: 51.5169,
    lng: -0.1998,
  },
];

const StoreMap = () => {
  const [primaryStore] = stores;
  const mapSrc = `https://maps.google.com/maps?q=${primaryStore.lat},${primaryStore.lng}&z=12&output=embed`;

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-border bg-muted/10 relative">
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        title="Store map"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      />
      
      {/* Overlay with store markers */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
        <h4 className="text-sm font-medium text-foreground mb-3">Our Locations</h4>
        <div className="space-y-2">
          {stores.map((store, index) => (
            <div key={index} className="text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <span className="font-medium text-foreground">{store.name}</span>
              </div>
              <p className="text-muted-foreground ml-4">{store.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreMap;
