

// Fetching data
fetch("./nyuad.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    const geoNotesList = data.geoNotesList;
    if (geoNotesList && geoNotesList.length > 0) {
      const firstGeoNote = geoNotesList[0];

      // Using the coordinates from the firstGeoNote to set the map center
      mapboxgl.accessToken =
        "pk.eyJ1IjoicXVhbG5vdGVzIiwiYSI6ImNsbzV1dHF6ZTBkbDAybG56a2lqMjR2OTAifQ.oOqxb62O7-gZXNmOX9Rhfg";
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v11",
        //style: 'mapbox://styles/mapbox/outdoors-v11',
        center: [firstGeoNote.lon, firstGeoNote.lat],
        zoom: 15.5,
        pitch: 45,
        bearing: -17.6,
        antialias: true,
      });


      map.on("load", function () {
        const geoNotesList = data.geoNotesList;

        // Function to add a marker and popup with a delay
        function addImageMarkerWithDelay(markerData, delay) {
          setTimeout(() => {
            const el = document.createElement("div");
            el.className = "marker";

            // Check the note_type and create marker and popup accordingly
            let popupHtml = '';
            if (markerData.note_type === "photo" && markerData.imgPath) {
              popupHtml = `<img src="${markerData.imgPath}" alt="Note Image" width="150"/>`;
            } // Add cases for other types if needed

            // Create and add the marker to the map
            new mapboxgl.Marker(el)
              .setLngLat([markerData.lon, markerData.lat])
              .setPopup(new mapboxgl.Popup({ offset: 25, maxWidth: "350px" }).setHTML(popupHtml))
              .addTo(map);
          }, delay);
        }

        geoNotesList.forEach((markerData) => {
          const el = document.createElement("div");
          el.className = "marker";

          // Creating an image marker and adding the image popup
          if (markerData.note_type === "photo" && markerData.imgPath) {
            new mapboxgl.Marker()
              .setLngLat([markerData.lon, markerData.lat]) // Marker [lng, lat] coordinates
              .addTo(map); // Add the marker to the map

            //popup
            new mapboxgl.Marker(el)
              .setLngLat([markerData.lon, markerData.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25, maxWidth: "350px" }).setHTML(
                  `<img src="${markerData.imgPath}" alt="Note Image" width="150"/>` //You can adjust this
                )
              )
              .addTo(map);

            // Add the image and text to the sidecar
            var sidecar = document.getElementById("sidecar");
            var img = document.createElement("img");
            img.src = markerData.imgPath;
            img.alt = "Note Image";
            img.width = 300; // You can adjust this
            sidecar.appendChild(img);
          }

          // Creating an text marker and adding the text popup
          if (markerData.note_type === "text") {
            new mapboxgl.Marker()
              .setLngLat([markerData.lon, markerData.lat]) // Marker [lng, lat] coordinates
              .addTo(map); // Add the marker to the map

            //popup
            new mapboxgl.Marker(el)
              .setLngLat([markerData.lon, markerData.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25, maxWidth: "350px" }).setHTML(
                  //You can adjust this
                  `<p>${markerData.text}</p>`
                )
              )
              .addTo(map);

            // Add the text to the sidecar
            var sidecar = document.getElementById("sidecar");
            var text = document.createElement("text");
            sidecar.appendChild(text);
            if (markerData.text) {
              var text = document.createElement("p");
              text.innerText = markerData.text;
              sidecar.appendChild(text);
            }
          }

          // Creating an audio marker and adding the audio popup
          if (markerData.note_type === "audio" && markerData.audioPath) {
            new mapboxgl.Marker()
              .setLngLat([markerData.lon, markerData.lat]) // Marker [lng, lat] coordinates
              .addTo(map); // Add the marker to the map

            //popup
            new mapboxgl.Marker(el)
              .setLngLat([markerData.lon, markerData.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25, maxWidth: "350px" }).setHTML(
                  `<audio controls src= "${markerData.audioPath}" type= "audio/mp3"/>` //You can adjust this
                )
              )
              .addTo(map);

            // Add the audio and text to the sidecar
            var sidecar = document.getElementById("sidecar");
            var audio = document.createElement("audio");
            audio.controls = "controls";
            audio.src = markerData.audioPath;
            audio.type = "audio/mp3";
            sidecar.appendChild(audio);
          }

          // Creating the route markers
          if (markerData.note_type === "routepoint") {
            // Add a marker to the map
            //new mapboxgl.Marker(el).setLngLat([markerData.lon, markerData.lat]);
          }
        });

        //Parsing data
        const coords = geoNotesList.map((markerData) => [
          markerData.lon,
          markerData.lat,
        ]);

        //Adding polyline
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coords,
            },
          },
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#009",
            "line-width": 8,
          },
        });

        //Adding 3d Layer
        map.addLayer({
          id: "add-3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            // Use an 'interpolate' expression to
            // add a smooth transition effect to
            // the buildings as the user zooms in.
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
          // The 'building' layer in the Mapbox Streets
          // vector tileset contains building height data
          // from OpenStreetMap.
        });
        setTimeout(function () {
          const rotationDuration = 9000; // 3 seconds
          const startingBearing = map.getBearing();
          const endingBearing = startingBearing + 180; // One full rotation
          const zoomIncreaseFactor = 1.1; // 20% increase
          const newZoomLevel = map.getZoom() * zoomIncreaseFactor;
          map.easeTo({
            bearing: endingBearing,
            pitch: 70,
            zoom: newZoomLevel,
            duration: rotationDuration
            // Removed the easing function for a normal rotation
          });
        }, 300);  //the timeout as needed



      });


    } else {
      console.error("geoNotesList is empty or does not exist:", geoNotesList);
    }
  })
  .catch((error) => {
    console.error("There has been a problem with your fetch operation:", error);
  });
