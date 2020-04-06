import React, { useState, useEffect } from "react";
import { Slider } from 'react-semantic-ui-range';
import numeral from 'numeral';
import { Dropdown, Radio, Icon } from 'semantic-ui-react';
import Map from './components/Map';
import Chart from './components/Chart';
import moment from 'moment';
import { IoIosArrowDropleftCircle, 
    IoIosArrowDroprightCircle } from 'react-icons/io';
import { MdPauseCircleFilled } from "react-icons/md";
import axios from 'axios';
// import colormap from 'colormap';


import './App.css';

require('polyfill-object.fromentries');



const App = () => {


    const [pageSizeRatio, setPageSizeRatio] = useState(1);

    const geoCentroids = require('./data/StateCentroids.json');
    const geoNames = require('./data/StateCodes.json');

    const path = document.location.pathname.toUpperCase();
    const parsedPath = path.split('/');
    // const dashboard = parsedPath[1] ? parsedPath[1].toLowerCase() === 'dashboard' ? true : false : false; 
    const geoParam = parsedPath[1] !== "" || 'US' ? parsedPath[1] : null;
    const paramGeoInfo = geoParam ? geoCentroids.find(centroid =>
        centroid.state === geoNames[geoParam]) : null;

    const [dashboard, setDashboard] = useState(false)
    


    const stateOptions = [{
        text: 'United States',
        value: 'US',
        key: 'US'
    }];

    Object.entries(geoNames).map(([id, name]) => 
        stateOptions.push({
            text: name,
            value: id.toUpperCase(),
            key: id
    }));

    const speeds = [
        {
            text: '1 second',
            key: '1-sec',
            value: 1000
        },
        {
            text: 'a half second',
            key: '1-2-sec',
            value: 500
        },
        {
            text: 'a quarter second',
            key: '1-4-sec',
            value: 250
        },
        {
            text: 'a tenth of a second',
            key: '1-10-sec',
            value: 100
        }
    ];

    // const arcCounties = [
    //     "DeKalb County",
    //     "Cobb County",
    //     "Gwinnett County",
    //     "Fulton County",
    //     "Cherokee County",
    //     "Clayton County",
    //     "Henry County",
    //     "Douglas County",
    //     "Fayette County",
    //     "Rockdale County"
    // ];

    const [selectedPlace, setSelectedPlace] = useState();
    // console.log(selectedPlace);

    const calcPageSizeRatio = () => {
        const { innerWidth: width } = window;
        setPageSizeRatio(width <= 600 ? .5 : 1);
    }

    const [pointsObj, setPointsObj] = useState();

    let globalcases = require('./data/Confirmed_COV19_Cases.json');
    let globaldeaths = require('./data/Deaths_COV19.json');
    let uscases = require('./data/Confirmed_COV19_Cases_US_Counties.json')
        .filter(county => paramGeoInfo ? county.State === geoParam : true);
    let usdeaths = require('./data/Deaths_COV19_US_Counties.json')
        .filter(county => paramGeoInfo ? county.State === geoParam : true);
    const pops = require('./data/pop2019.json');    
    const apiBaseURL = 'https://covid19-data-server.herokuapp.com/';
    
    // console.log(pops)

    const [usCases, setUSCases] = useState(uscases);
    const [usDeaths, setUSDeaths] = useState(usdeaths);
    const [globalCases, setGlobalCases] = useState(globalcases);
    const [globalDeaths, setGlobalDeaths] = useState(globaldeaths);
        
    const getInitData = () =>  {
    
        axios.get(`${apiBaseURL}uscases`)
            .then(res => setUSCases(
                res.data.filter(county => 
                    paramGeoInfo ? county.State === geoParam : true))
            )
            .catch(err => console.log(err));
        
        axios.get(`${apiBaseURL}usdeaths`)
            .then(res => setUSDeaths(
                res.data.filter(county => 
                    paramGeoInfo ? county.State === geoParam : true))
            )
            .catch(err => console.log(err));

        axios.get(`${apiBaseURL}globalcases`)
            .then(res => setGlobalCases(res.data))
            .catch(err => console.log(err));

        axios.get(`${apiBaseURL}globaldeaths`)
            .then(res => setGlobalDeaths(res.data))
            .catch(err => console.log(err));
    };


    // console.log(globalDeaths);
    
    const points = require('./data/US_Counties_w_Centroid.json');


    const createPointsObj = points => {
        const entries = points.map(point =>
            [point.FIPS, {
                Lat: parseFloat(point.Lat),
                Long: parseFloat(point.Long)
            }
            ]);

        const pointsObj = Object.fromEntries(entries)

        setPointsObj(pointsObj)
    }

    const [scale, setScale] = useState('global');
    const [legendOpen, setLegendOpen] = useState(true);

    const selectedPlaceCases = selectedPlace ?
        scale === 'us counties' ? usCases.find(usCase =>
            selectedPlace.label1 === usCase['County Name'] &&
            selectedPlace.label2 === usCase['State']
        )
            : globalCases.find(globalCase =>
                globalCase['Province/State'] ?
                    selectedPlace.label1 === globalCase['Province/State'] &&
                    selectedPlace.label2 === globalCase['Country/Region'] :
                    selectedPlace.label2 === globalCase['Country/Region'])
        : null


    const selectedPlaceDeaths = selectedPlace ?
        scale === 'us counties' ? usDeaths.find(usDeath =>
            selectedPlace.label1 === usDeath['County Name'] &&
            selectedPlace.label2 === usDeath['State']
        )
            : globalDeaths.find(globalDeath =>
                globalDeath['Province/State'] ?
                    selectedPlace.label1 === globalDeath['Province/State'] &&
                    selectedPlace.label2 === globalDeath['Country/Region'] :
                    selectedPlace.label2 === globalDeath['Country/Region'])
        : null


    const centerZoom = {
        center: scale === 'global' ?
            [pageSizeRatio <= .5 ? -10.491543894043556 :
                19.673464612389843,
            pageSizeRatio <= .5 ? 14.511772386503857 :
                13.36421484205365] :
            !paramGeoInfo ?
                [37.89, pageSizeRatio <= .5 ? -98 : -100.41] :
                [paramGeoInfo.latitude, paramGeoInfo.longitude],
        zoom: scale === 'global' ?
            pageSizeRatio <= .5 ?
                1 :
                2.7 :
            !paramGeoInfo ?
                pageSizeRatio <= .5 ?
                    3.1 : 4.8
                : paramGeoInfo.zoom
    }

    const [speed, setSpeed] = useState(500);
    const [calcRate, setCalcRate] = useState(true);


    const dateArray = scale === 'global' && globalCases ?
        [...Object.keys(globalCases[0])].filter(key =>
            key !== '_id' &&
            key !== 'UID' &&
            key !== 'Province/State' &&
            key !== 'Country/Region' &&
            key !== 'Lat' &&
            key !== 'Long'

        ) : scale === 'us counties' && usCases ?
            [...Object.keys(usCases[0])].filter(key =>
                key !== '_id' &&
                key !== 'countyFIPS' &&
                key !== 'County Name' &&
                key !== 'State' &&
                key !== 'stateFIPS'
            ) : null;

    const [month, day, year] = dateArray[dateArray.length - 1].split('/');
    const endDate = `${month}/${day}/${year}`;
    
    
    const [minDate, maxDate] = [
        0,
        dateArray.indexOf(endDate)
    ];

    // console.log(dateArray);
    // console.log(endDate);
    const [date, setDate] = useState(0);



    // console.log(dateArray);

    let totalConfirmed = 0;
    let totalDeaths = 0;

    scale === 'global' ?
        globalCases.map(point => point[dateArray[date]] ? totalConfirmed = totalConfirmed + parseFloat(point[dateArray[date]]) : 
        point[`${dateArray[date]}20`] ? totalConfirmed = totalConfirmed + parseFloat(point[`${dateArray[date]}20`]) : null)
        : usCases.map(point => point[dateArray[date]] ? totalConfirmed = totalConfirmed + parseFloat(point[dateArray[date]]) : 
        point[`${dateArray[date]}20`] ? totalConfirmed = totalConfirmed + parseFloat(point[`${dateArray[date]}20`]) : null);

    scale === 'global' ?
        globalDeaths.map(point => point[dateArray[date]] ? totalDeaths = totalDeaths + parseFloat(point[dateArray[date]]) : 
        point[`${dateArray[date]}20`] ? totalDeaths = totalDeaths + parseFloat(point[`${dateArray[date]}20`]) : null)
        : usDeaths.map(point => point[dateArray[date]] ? totalDeaths = totalDeaths + parseFloat(point[dateArray[date]]) : 
        point[`${dateArray[date]}20`] ? totalDeaths = totalDeaths + parseFloat(point[`${dateArray[date]}20`]) : null);


    const sliderSettings = {
        start: 0,
        min: minDate,
        max: maxDate,
        step: 1,
        onChange: value => setDate(value),
    };


    const [playStatus, setPlayStatus] = useState({
        direction: null,
        playing: false,
    });

    const [timerID, setTimerID] = useState();

    const playSlider = (init, duration, status, steps) => {

        const dateSteps = status.direction === 'reverse' ? -1 * steps : steps;

        let date = init;

        const increment = () => {
            date > maxDate || date < minDate ?
                setPlayStatus({ playing: false }) : setDate(date);
            date = date + dateSteps;
        }

        let timer = setInterval(increment, duration);

        setTimerID(timer)
    }

    const stopSlider = () => clearInterval(timerID);

    const sliderStartStop = (init, duration, status, steps) =>
        !playStatus.playing ? stopSlider() :
            playStatus.direction ? playSlider(init, duration, status, steps) : null;

    const legendBreaks = [50, 500, 5000];

    const [chartGeoOptions, setChartGeoOptions] = useState();
    const [chartGeoSelections, setChartGeoSelections] = useState();

    const handleChartGeoOptions = (data, loc1, loc2) => {
        const options = data.map((item, i) => ({
            text: `${item[loc1]}${item[loc1] !== "" ? ', ' : ""}${item[loc2] === 'US' ? 'United States' : item[loc2]}`,
            value: { loc1 : item[loc1], loc2 : item[loc2]},
            key: `option-${scale}-${i}`
        }))
        setChartGeoOptions(options);
    };

    // const numberOfBins = chartGeoSelections ? 
    //     chartGeoSelections.length < 11 ? 11 
    //     : chartGeoSelections.length : 11;
    // const colorMap = 'phase';


    const colors = [
        // '#51574a',
        // '#447c69',
        '#74c493',
        // '#8e8c6d',
        '#e4bf80',
        '#e9d78e',
        '#e2975d',
        '#f19670',
        '#e16552',
        '#c94a53',
        '#be5168',
        '#a34974',
        '#993767',
        '#65387d',
        '#4e2472',
        '#9163b6',
        '#e279a3',
        '#e0598b',
        '#7c9fb0',
        '#5698c4',
        '#9abf88'
    ]
    
    // colormap({
    //     colormap: colorMap,
    //     nshades: numberOfBins,
    //     format: 'hex',
    //     alpha: 1
    //   });


    useEffect(() => 
        scale === 'global' ? 
            handleChartGeoOptions(globalCases, 'Province/State', 'Country/Region') :
        handleChartGeoOptions(usCases, 'County Name','State'), [scale])
    
    useEffect(() => setChartGeoSelections(), [scale]);

    // useEffect(() => setChartGeoSelections([
    //     {
    //         "loc1":"Hubei",
    //         "loc2":"China"
    //     },
    //     {
    //         "loc1":"",
    //         "loc2":"Italy"
    //     },
    //     {
    //         "loc1":"",
    //         "loc2":"Spain"
    //     },
    //     {
    //         "loc1":"",
    //         "loc2":"US"
    //     }
    // ]), [globalCases]);
    
    // useEffect(() => shuffle(colors), [])

    useEffect(() => sliderStartStop(date, speed, playStatus, 1),
        [playStatus.playing]);

    useEffect(() => points ? createPointsObj(points) : null, []);

    useEffect(() => calcPageSizeRatio(), [])
    useEffect(() => getInitData(), []);


    return (
        <div id='main-wrapper'>
            <div id='global-total-counts'>
                <div id='cases-count'>
                    <div className='count-label'>Total Confirmed Cases:
                    </div>{numeral(totalConfirmed).format('0,0')}
                </div>
                <div id='scale-toggle'>
                    <span
                        className={scale === 'us counties' ? 'unselected-scale-label' : null}
                    >
                        Global
                    </span>
                    <Radio
                        toggle
                        checked={scale === 'global' ? false : true}
                        onChange={() => {
                            setSelectedPlace();
                            setChartGeoSelections();
                            scale === 'global' ? setScale('us counties') : setScale('global')
                        }}
                    />
                    <span
                        className={scale === 'global' ? 'unselected-scale-label' : null}
                    >
                        <Dropdown
                            inline
                            // search
                            value={paramGeoInfo ?
                                geoParam.toUpperCase() :
                                "US"
                            }
                            options={stateOptions}
                            onChange={(e, data) => window.location = `./${data.value}`}
                        />
                    </span>
                    <div id={'mobile-view-selector'}>
                    {   dashboard ?
                        <p onClick={() => setDashboard(false)
                        }>Swith to map</p> :
                        <p onClick={() => setDashboard(true)
                        }>Swith to chart</p>
                    }
                    </div>


                </div>
                <div id='death-count'>
                    <div className='count-label'> Total Deaths: </div>{numeral(totalDeaths).format('0,0')}
                </div>
            </div>
            <h1 id='date-label'>{moment(dateArray[date]).format('MMMM Do, YYYY')}</h1>
            <div id='control-wrapper'>

                <div>
                    <div
                        className='play-pause-buttons'
                        style={{ float: 'left', width: '10%' }}
                    >
                        {
                            playStatus.playing && playStatus.direction === 'reverse' ?
                                <MdPauseCircleFilled
                                    style={{ float: 'right', width: '40px', height: '40px' }}
                                    onClick={() => setPlayStatus({ playing: false })}
                                /> :
                                <IoIosArrowDropleftCircle
                                    disabled={date === minDate ? true : false}
                                    style={{
                                        float: 'right',
                                        width: '40px',
                                        height: '40px',
                                        fill: playStatus.direction === 'forward' &&
                                            playStatus.playing ? 'lightgrey' : null ||
                                                date === minDate ? 'lightgrey' : null
                                    }}
                                    onClick={() =>
                                        playStatus.direction === 'forward' &&
                                            playStatus.playing ? null
                                            : setPlayStatus({ playing: true, direction: 'reverse' })
                                    }
                                />
                        }
                    </div>
                    <div onClick={playStatus.playing ?
                        () => setPlayStatus({ playing: false })
                        : null} id={'income-slider'} style={{ float: 'left', width: '80%' }}>


                        <Slider
                            style={{ float: 'center', width: '100%' }}
                            value={date}
                            settings={sliderSettings}
                            color='red'
                        />
                    </div>
                    <div
                        className='play-pause-buttons'
                        style={{ float: 'left', width: '10%' }}>
                        {
                            playStatus.playing &&
                                playStatus.direction === 'forward' ?
                                <MdPauseCircleFilled
                                    style={{ float: 'left', width: '40px', height: '40px' }}
                                    onClick={() => setPlayStatus({ playing: false })}
                                /> :
                                date !== maxDate ?
                                    <IoIosArrowDroprightCircle
                                        // className={'pulse'}
                                        style={{
                                            float: 'left',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            fill: playStatus.direction === 'reverse' && playStatus.playing ? 'lightgrey' : null
                                        }}
                                        onClick={() => playStatus.direction === 'reverse' && playStatus.playing ? null : setPlayStatus({ playing: true, direction: 'forward' })}
                                    /> :
                                    <Icon
                                        style={{
                                            float: 'left',
                                            position: 'relative',
                                            top: '5px'
                                            // width: '40px',
                                            // height: '40px',
                                            // borderRadius: '50%',
                                            // fill: playStatus.direction === 'reverse' && playStatus.playing ? 'lightgrey' : null
                                        }}
                                        name='repeat'
                                        size='big'
                                        onClick={() => {
                                            setDate(0);
                                            setPlayStatus({ playing: true, direction: 'forward' })
                                        }}
                                    />

                        }
                    </div>


                </div>
                <div id='speed-selector'>
                    Each day equals
                <Dropdown
                        disabled={playStatus.playing ? true : false}
                        inline
                        style={{
                            margin: '0 0 0 10px',
                            fontSize: '1.5em'
                        }}
                        options={speeds}
                        value={speed}
                        onChange={(e, data) => setSpeed(data.value)}
                    />

                </div>
            </div>
            <div className={'desktop-view-selector'}>
                    {   dashboard ?
                        <p onClick={() => setDashboard(false)
                        }>Hide charts</p> :
                        <p onClick={() => setDashboard(true)
                        }>Show charts</p>
                    }
                    </div>
            <div
                className={dashboard ? 'map-container mobile-hidden': 'map-container'}
                id={dashboard ? 'map-container-dashboard' : null}
                // style={{width: dashboard ? '60%' : null}}
            >
                <Map
                    // paramGeoInfo={paramGeoInfo}
                    pops={pops}
                    calcRate={calcRate}
                    pageSizeRatio={pageSizeRatio}
                    selectedPlace={selectedPlace}
                    setSelectedPlace={setSelectedPlace}
                    dateIndex={date}
                    dateArray={dateArray}
                    points={scale === 'us counties' ? points : null}
                    pointsObj={pointsObj ? pointsObj : null}
                    centerZoom={centerZoom}
                    pointData1={scale === 'us counties' ? usCases : globalCases}
                    pointData2={scale === 'us counties' ? usDeaths : globalDeaths}
                    name={'left'}
                />
            </div>
            {
                dashboard ?
            <div id={!dashboard ? 'chart-container mobile-hidden' : 'chart-container'}>
                <div id='chart-dropdown-wrapper'>

                    <Dropdown
                    // style={{margin: '0 0 20px 0'}} 
                    fluid
                    multiple
                    selection
                    search
                    renderLabel={(item, i) => <div 
                          className="ui label" 
                          value={item.value}
                          style={{backgroundColor: colors[i]}}
                        >
                            {item.text}
                            <i 
                              onClick={() => {
                                  const selectedList = [...chartGeoSelections];
                                  selectedList.splice(i, 1);

                                //   console.log(selectedList);
                                  setChartGeoSelections(selectedList);
                              }}
                            aria-hidden="true" className="delete icon" />
                        </div>
                    }
                    placeholder={'Select geographies to chart'}
                    options={chartGeoOptions}
                    value={chartGeoSelections ? chartGeoSelections : []}
                    onChange={(e,data) => 
                        setChartGeoSelections(data.value)}
                    />
                {
                    chartGeoSelections ? 
                    <div 
                        onClick={() => setChartGeoSelections()}
                        id='clear-selections'>clear</div> : null
                }
                <Radio
                    label='per 100K people' 
                    toggle
                    checked={calcRate ? true : false}
                    onChange={() => setCalcRate(calcRate ? false : true)}
                />
                </div>


                <Chart
                  pops={pops}
                  calcRate={calcRate}
                  colors={colors} 
                  cases={scale === 'global' ? globalCases : usCases}
                  deaths={scale === 'global' ? globalDeaths : usDeaths}
                  selectedGeos={chartGeoSelections}
                  scale={scale}
                  dates={dateArray}
                  label={'Confirmed Cases'}
                //   selectedPlace={selectedPlace}
                  dateIndex={date}
                  
                />
                <Chart
                  pops={pops}
                  calcRate={calcRate}
                  colors={colors} 
                  cases={scale === 'global' ? globalDeaths : usDeaths}
                  selectedGeos={chartGeoSelections}
                  scale={scale}
                  dates={dateArray}
                  label={'Deaths'}
                //   selectedPlace={selectedPlace}
                  dateIndex={date}
                  
                />
            </div>
                : null}

            {
                !selectedPlace ?


                    <div 
                        className={dashboard ? 'mobile-hidden' : null}
                        id={legendOpen ? 'legend-button-close' : 'legend-button-open'}>
                        <Icon name={legendOpen ? 'close circle' : 'info circle'} size={legendOpen ? 'large' : 'big'} onClick={() => setLegendOpen(legendOpen ? false : true)} />
                    </div> : null
            }
            {
                !selectedPlace && legendOpen ?


                    <div
                    className={dashboard ? 'mobile-hidden' : null}

                    >
                        <div
                            id='left-legend'
                            className='legend'>
                            <div className='label-row'>
                                Confirmed Cases
                            </div>
                            <div className='symbol-row'>
                                {
                                    legendBreaks.map(value => {
                                        const radius = Math.sqrt(value / 3.141592653589793);

                                        // console.log(radius)
                                        return (
                                            <div className='symbol-box'>
                                                <div
                                                    style={{
                                                        height: `${radius * 2 * pageSizeRatio}px`,
                                                        width: `${Math.sqrt(value / 3.141592653589793) * 2 * pageSizeRatio}px`,
                                                        borderRadius: '50%',
                                                        border: 'solid blue 1px',
                                                        float: 'right',
                                                        backgroundColor: 'rgba(0,0,255,0.1)'

                                                    }}
                                                />
                                            </div>)
                                    })
                                }
                            </div>

                        </div>
                        <div
                            id='center-legend'
                            className='legend'>
                            <div>
                            </div>
                            <div className='symbol-row'>
                                {
                                    legendBreaks.map(value =>
                                        <div
                                            style={{
                                                paddingTop: `${Math.sqrt(value / 3.141592653589793) * pageSizeRatio}px`
                                            }}
                                            className='value-box'>
                                            {numeral(value).format('0,0')}
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                        <div
                            id='right-legend'
                            className='legend'
                        >
                            <div className='label-row'>
                                Deaths
                            </div>
                            <div className='symbol-row'>
                                {
                                    legendBreaks.map(value => {
                                        const radius = Math.sqrt(value / 3.141592653589793);

                                        return (
                                            <div className='symbol-box'>
                                                <div
                                                    style={{
                                                        height: `${radius * 2 * pageSizeRatio}px`,
                                                        width: `${Math.sqrt(value / 3.141592653589793) * 2 * pageSizeRatio}px`,
                                                        borderRadius: '50%',
                                                        border: 'solid red 1px',
                                                        float: 'left',
                                                        backgroundColor: 'rgba(255,0,0,0.1)'

                                                    }}
                                                />
                                            </div>)
                                    })
                                }
                            </div>

                        </div>

                    </div>

                    : null
            }
            {
                selectedPlace ?

                    <div 
                    className={dashboard ? 'mobile-hidden': null}

                    id={'selected-info-button-close'}>
                        <Icon
                            //   disabled={false : true} 
                            name={'close circle'}
                            size={'large'}
                            onClick={() =>
                                setSelectedPlace()} />
                    </div> : null
            }

            {
                selectedPlace ?
                    <div 
                        className={dashboard ? 'info-box mobile-hidden': 'info-box'}
                    >
                        <div id='selected-label1'>{selectedPlace.label1 ? selectedPlace.label1 : 'All'}</div>
                        <div id='selected-label2'>{selectedPlace.label2}</div>
                        <div id='selected-cases'>Confirmed Cases {selectedPlaceCases ?
                            <div>
                                {numeral(selectedPlaceCases[dateArray[date]] ? selectedPlaceCases[dateArray[date]] : selectedPlaceCases[`${dateArray[date]}20`]).format('0,0')}
                            </div> : null}
                        </div>
                        <div id='selected-deaths'>Deaths{selectedPlaceDeaths ?
                            <div>
                                {numeral(selectedPlaceDeaths[dateArray[date]] ? selectedPlaceDeaths[dateArray[date]] : selectedPlaceDeaths[`${dateArray[date]}20`]).format('0,0')}
                            </div> : null}</div>
                        <div id='current-data'>as of {moment(dateArray[date]).format('MMMM Do, YYYY')}</div>

                    </div>
                    : null
            }
            <div id='data-source'>
                <div>


                    Data Source: {
                        scale === 'global' ?
                            <a
                                target='_blank'
                                rel="noopener noreferrer"
                                href='https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data'>
                                Johns Hopkins CSSE
                    </a> :
                            <a
                                target='_blank'
                                rel="noopener noreferrer"
                                href='https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/'>
                                USA Facts
                    </a>
                    }
                </div>
                <div style={{ width: '100%' }}> <small>Last updated 3/31/20 at 7:40 am</small></div>
            </div>
        </div>
    )
};

export default App;
