import React from 'react';
import { Map as LeafletMap, TileLayer, CircleMarker } from 'react-leaflet';

const Map = props => {

    const pointData1 = props.pointData1;
    const pointData2 = props.pointData2;
    const pointsObj = props.pointsObj;


    return (
        <LeafletMap
          key={'leaflet-map-' + props.name}
          center={props.centerZoom.center}
          zoom={props.centerZoom.zoom}
          maxZoom={11}
          zoomDelta={.3}
          boxZoom={true}
          trackResize={true}
          zoomSnap={.3}
          bounds={props.bounds}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          animate={false}
          //   onMoveEnd={e => console.log(e.target.getCenter())}  
        >
        {
            pointData2 ? pointData2
            .map((point, i) => {
                const pointInfo = pointsObj ? pointsObj[point.countyFIPS] : null;

                const lat = pointInfo ?  Number.parseFloat(pointInfo.Lat) : parseFloat(point.Lat);
                const lng = pointInfo ?  Number.parseFloat(pointInfo.Long) : parseFloat(point.Long);

                const value = point[props.dateArray[props.dateIndex]] ? point[props.dateArray[props.dateIndex]] : point[`${props.dateArray[props.dateIndex]}20`];
                const placeLabel1 = point ? point['Province/State'] || point['County Name'] : null;
                const placeLabel2 = point ? point['Country/Region'] || point['State'] : null;

                // const otherData = pointData1.find(data =>
                //     data['Province/State'] === placeLabel1 && 
                //     data['Country/Region']  === placeLabel2
                // )  ||  
                //     pointData2.find(data =>
                //         data['County Name'] === placeLabel1 && 
                //         data['State']  === placeLabel2
                //     );                ;



                return (
                !isNaN(lat) &&
                !isNaN(lng) &&   
                typeof lat === 'number' && 
                typeof lng === 'number' &&
                value > 0 ? 
                
                <CircleMarker
                    key={'marker' + i} 
                    id={i}
                    center={[lat, lng]}
                    radius={Math.sqrt(value/3.141592653589793) * props.pageSizeRatio}
                    fill={true}
                    weight={1}
                    color={'red'}
                    onClick={e => props.setSelectedPlace({
                        label1 : placeLabel1,
                        label2 : placeLabel2,
                        // cases: otherData ? otherData[props.dateArray[props.dateIndex]] : null,
                        // deaths: point[props.dateArray[props.dateIndex]],
                        lat: lat,
                        long: lng

                    })}
                /> : null
                )}
            ) : null
            }
            {
            pointData1 ? pointData1
            .map((point, i) => {
                const pointInfo = pointsObj ? pointsObj[point.countyFIPS] : null;

                const lat = pointInfo ?  parseFloat(pointInfo.Lat) : parseFloat(point.Lat);
                const lng = pointInfo ?  parseFloat(pointInfo.Long) : parseFloat(point.Long);

                const value = point[props.dateArray[props.dateIndex]] ? point[props.dateArray[props.dateIndex]] : point[`${props.dateArray[props.dateIndex]}20`];
                const placeLabel1 = point ? point['Province/State'] || point['County Name'] : null;
                const placeLabel2 = point ? point['Country/Region'] || point['State'] : null;

                // const otherData = pointData2.find(data =>
                //     data['Province/State'] === placeLabel1 && 
                //     data['Country/Region']  === placeLabel2
                // )  ||  
                //     pointData2.find(data =>
                //         data['County Name'] === placeLabel1 && 
                //         data['State']  === placeLabel2
                //     );                ;


                return (
                !isNaN(lat) &&
                !isNaN(lng) &&   
                typeof lat === 'number' && 
                typeof lng === 'number' &&
                value > 0 ? 
                
                <CircleMarker
                    key={'case-marker' + i} 
                    id={i}
                    weight={props.selectedPlace ? 
                        props.selectedPlace.label1 === placeLabel1 &&
                        props.selectedPlace.label2 === placeLabel2 ? 
                        3 : 1 : 1}
                    center={[lat, lng]}
                    radius={Math.sqrt(value/3.141592653589793) * props.pageSizeRatio}
                    fill={true}
                    color={'blue'}
                    onClick={e => props.selectedPlace ? 
                        props.selectedPlace.label1 === placeLabel1 &&
                        props.selectedPlace.label2 === placeLabel2 ?
                        props.setSelectedPlace() :
                        props.setSelectedPlace({
                        label1 : placeLabel1,
                        label2 : placeLabel2,
                        // deaths: otherData ? otherData[props.dateArray[props.dateIndex]] : null,
                        // cases: point[props.dateArray[props.dateIndex]],
                        lat: point.Lat,
                        long: point.Long
                    }) :
                    props.setSelectedPlace({
                        label1 : placeLabel1,
                        label2 : placeLabel2,
                        // deaths: otherData ? otherData[props.dateArray[props.dateIndex]] : null,
                        // cases: point[props.dateArray[props.dateIndex]],
                        lat: point.Lat,
                        long: point.Long
                    })
                }
                
                /> : null
                )}
                ) : null
            }
                        {
            pointData1 ? pointData1
            .map((point, i) => {
                const pointInfo = pointsObj ? pointsObj[point.countyFIPS] : null;

                const lat = pointInfo ?  parseFloat(pointInfo.Lat) : parseFloat(point.Lat);
                const lng = pointInfo ?  parseFloat(pointInfo.Long) : parseFloat(point.Long);

                const value = point[props.dateArray[props.dateIndex]] ? point[props.dateArray[props.dateIndex]] : point[props.dateArray[props.dateIndex] + '20'];
                const placeLabel1 = point ? point['Province/State'] || point['County Name'] : null;
                const placeLabel2 = point ? point['Country/Region'] || point['State'] : null;

                // const otherData = pointData2.find(data =>
                //     data['Province/State'] === placeLabel1 && 
                //     data['Country/Region']  === placeLabel2
                // )  ||  
                //     pointData2.find(data =>
                //         data['County Name'] === placeLabel1 && 
                //         data['State']  === placeLabel2
                //     );                ;


                return (
                !isNaN(lat) &&
                !isNaN(lng) &&   
                typeof lat === 'number' && 
                typeof lng === 'number' &&
                value > 0 ? 
                
                <CircleMarker
                    key={'case-marker' + i} 
                    id={i}
                    weight={0}
                    center={[lat, lng]}
                    radius={value < 5 ? 10 : Math.sqrt(value/3.14) * props.pageSizeRatio}
                    fill={true}
                    color={'transparent'}
                    onClick={e => props.selectedPlace ? 
                        props.selectedPlace.label1 === placeLabel1 &&
                        props.selectedPlace.label2 === placeLabel2 ?
                        props.setSelectedPlace() :
                        props.setSelectedPlace({
                        label1 : placeLabel1,
                        label2 : placeLabel2,
                        // deaths: otherData ? otherData[props.dateArray[props.dateIndex]] : null,
                        // cases: point[props.dateArray[props.dateIndex]],
                        lat: point.Lat,
                        long: point.Long
                    }) :
                    props.setSelectedPlace({
                        label1 : placeLabel1,
                        label2 : placeLabel2,
                        // deaths: otherData ? otherData[props.dateArray[props.dateIndex]] : null,
                        // cases: point[props.dateArray[props.dateIndex]],
                        lat: point.Lat,
                        long: point.Long
                    })
                }
                
                /> : null
                )}
                ) : null
            }


        <TileLayer 
            key={'tile-layer-grey'}
            attribution={'&copy <a href="http://osm.org/copyright">OpenStreetMap contributors</a>'}
            url={'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'}
            
        />
    </LeafletMap>)
}

export default Map;