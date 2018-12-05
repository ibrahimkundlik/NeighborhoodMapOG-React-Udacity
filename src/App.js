import React, { Component } from 'react';
import './App.css';

let showVenue, map, lastOpenedInfoWindow, infowindow

class App extends Component {

  state = {
    locations: [],
    markers: [],
    query: "",
    newLocations: []
  }

  componentDidMount() {
    this.getLocations()
  }

  //Getting data from Foursquare API
  getLocations = () => {
    fetch(`https://api.foursquare.com/v2/venues/explore?
      &ll=18.915224, 72.825917
      &radius=500
      &section=trending
      &client_id=IUPF23KD5R1JFLJXJD1FZB3HDWB4I4EAAHN1RXFCEHZEY1V3
      &client_secret=VFY4DKU5CPLMMDFHEEFOP3UFQP4JTTJIMSWFT0MW5Z1HZVYE
      &v=20180820`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          locations: data.response.groups[0].items,
          newLocations: data.response.groups[0].items
        }, this.loadMap())
      })
      .catch(error => {
        console.log('Error in fetching Foursquare API - ' + error)
        alert('Error in fetching Foursquare API - ' + error)
      })
    }

  //Creating the script tag by using loadScript function
  loadMap = () => {
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyBhibMrZmpgIDyfqV_8TKB7syPkcZtqiaY&callback=initMap")
    window.initMap = this.initMap
  }

  //Google Maps initialization
  initMap = () => {

    var myLatLng = {
      lat: 18.915224,
      lng: 72.825917
    }
    map = new window.google.maps.Map(document.getElementById('map'), {
      center: myLatLng,
      zoom: 16
    })
    this.state.markers = []

    //Mapping through locations array to create markers and infowindow
    this.state.newLocations.map(venueMarker => {

      //Infowindow content to be displayed
      var contentString = '<div class="info-wrap">' +
        '<h2 class="info-name">' + venueMarker.venue.name + '</h2><br>' +
        '<p class="info-position">Latitude: ' + venueMarker.venue.location.lat + '</p><br>' +
        '<p class="info-position">Longitude: ' + venueMarker.venue.location.lng + '</p><br>' +
        '<p class="info-address">Address: ' + venueMarker.venue.location.address + '</p><br>' +
        '</div>'

      var marker = new window.google.maps.Marker({
        position: {
          lat: venueMarker.venue.location.lat,
          lng: venueMarker.venue.location.lng
        },
        map: map,
        title: venueMarker.venue.name
      })
      this.state.markers.push(marker)

      marker.addListener('click', function() {
        //Checking whether an infowindow is open or not
        if (lastOpenedInfoWindow) {
          lastOpenedInfoWindow.close();
        }
        //New infowindow
        infowindow = new window.google.maps.InfoWindow()
        infowindow.setContent(contentString)
        map.setCenter({
          lat: venueMarker.venue.location.lat,
          lng: venueMarker.venue.location.lng
        })
        infowindow.open(map, marker);
        lastOpenedInfoWindow = infowindow
      })
    })
  }

  //When a location from search list is clicked infowindow is loaded from function below
  openInfoWindow = (e) => {
    //Checking whether an infowindow is open or not
    if (lastOpenedInfoWindow) {
      lastOpenedInfoWindow.close();
    }
    //Getting the location info for the list item clicked
    let loc = this.state.newLocations.filter(l => l.venue.name === e.title)
    let venueClicked = loc[0].venue
    //New infowindow
    infowindow = new window.google.maps.InfoWindow()
    var contentString = '<div class="info-wrap">' +
      '<h2 class="info-name">' + venueClicked.name + '</h2><br>' +
      '<p class="info-position">Latitude: ' + venueClicked.location.lat + '</p><br>' +
      '<p class="info-position">Longitude: ' + venueClicked.location.lng + '</p><br>' +
      '<p class="info-address">Address: ' + venueClicked.location.address + '</p><br>' +
      '</div>'
    infowindow.setContent(contentString)
    infowindow.open(map, e);
    lastOpenedInfoWindow = infowindow
  }

  //Storing the search query in state
  updateQuery = (q) => {
    this.setState({
      query: q
    }, this.searchVenues)
  }

  //Getting filtered locations based on the search input
  searchVenues = () => {
    let f = this.state.query ? this.state.locations.filter(v =>
      v.venue.name.toLowerCase().includes(this.state.query)) : this.state.locations;
    this.setState({
      newLocations: f
    }, this.initMap)
  }

  //Showing and Hiding the Search container when the menu-icon is clicked
  menuClick = () => {
    const search = document.querySelector("#search")
    if (search.style.zIndex === "1") {
      search.style.zIndex = "0"
    } else {
      search.style.zIndex = "1"
    }
  }

  render() {
    const {query} = this.state
    if (query === '') {
      showVenue = this.state.locations
    } else {
      showVenue = this.state.newLocations
    }

    return ( 
      <div className = "all-content" >
        <nav className = "nav-wrapper" >
          <div className = "menu-icon" >
            <a 
            href = "#"
            aria-label = "Menu Icon"
            onClick = {
              this.menuClick
            }>< i className = "fa fa-bars" > < /i></a>
          </div> 
          <div className = "title" >
            <h1> NEIGHBORHOOD MAP </h1>
          </div>
        </nav>
        <section className = "main-content" >
          <div id = "search" >
            <div className = "search-bar" >
              <h3 > Location Search < /h3> 
                <div className = "search-input" >
                  <input 
                  type = "text"
                  placeholder = "Search..."
                  aria-label = "Search Location"
                  value = {
                    this.state.query
                  }
                  onChange = {
                    (event) => this.updateQuery(event.target.value)
                  }/>
                </div>
            </div> 
            <div className = "location-list" >
              <ul> {
                showVenue.map((location, k) =>
                  <li 
                  tabIndex = "0"
                  key = {k}
                  onClick = {
                    () => this.openInfoWindow(this.state.markers[k])
                  }> { location.venue.name } 
                  </li>)
                } 
              </ul> 
            </div> 
          </div> 
          <div id = "map"> </div> 
        </section> 
      </div>

      );
    }
  }


function loadScript(src) {
  var index = window.document.getElementsByTagName("script")[0]
  var script = window.document.createElement("script")
  script.src = src
  script.async = true
  script.defer = true
  index.parentNode.insertBefore(script, index)
}

export default App;