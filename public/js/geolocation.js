const socket = io();

ip = geoplugin_request();
city = geoplugin_city();
region = geoplugin_region();
country = geoplugin_countryName();
long = geoplugin_longitude();
lat = geoplugin_latitude();

socket.emit("userInfo", { ip, city, region, country, long, lat });
