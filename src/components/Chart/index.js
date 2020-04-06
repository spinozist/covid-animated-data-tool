import React from 'react';
import {
    ResponsiveContainer, 
    LineChart, 
    Line, 
    YAxis,
    XAxis,
    Tooltip,
    Label
} from 'recharts';
import numeral from 'numeral';
import moment from 'moment';
// import regression from 'regression';

const Chart = props => {

    const [loc1, loc2] = [
        props.scale === 'global' ? 'Province/State' : 'County Name', 
        props.scale === 'global' ? 'Country/Region' : 'State'
    ];

    const cases = props.cases;

    const selectedGeos = props.selectedGeos;
    
    console.log(selectedGeos);
    console.log(props.pops);

    const pDuration = 14;

    const dates = props.dates;
    const projectedDates = []
    
    for (let i = 1; i <= pDuration; i++) {
        projectedDates.push(
            moment(props.dates[props.dateIndex])
                .add(i, 'days')
                .format('M/D')
        )
    };

    // console.log(projectedDates);

    const data = [];
    // const projection = [];

    const calcRate = (value, pop, n) => {
        const numerator = value * n;
        const rate = numerator / pop;
        // numeral(rate).format('0.00')
        // console.log(rate);
        return rate;
    }

    const selectedData = selectedGeos ?
    selectedGeos.map(geo => 
        cases.find(item => 
            item[loc1] === geo.loc1 &&
            item[loc2] === geo.loc2)
    ) : null;

    console.log(selectedData);

    dates.forEach((date, i) => {
        const dataObj = {
            'name' : date.split('/').filter((item, i) => i <= 1).join('/'),
        };

        selectedGeos && props.calcRate ? 
        selectedGeos.forEach(geo => {
            // console.log(geo.loc2);
            dataObj[`${geo.loc1}${geo.loc1 !== "" ? ", " : ""}${geo.loc2}`] = props.dateIndex >= i ? 
            calcRate(cases.find(item => 
                item[loc1] === geo.loc1 &&
                item[loc2] === geo.loc2)[date],
                props.pops.find(item =>
                    item.loc1 === geo.loc1 &&
                    item.loc2 === geo.loc2)['Pop2019'],
                    100000) : null
        }) : selectedGeos ?
        selectedGeos.forEach(geo => {
            // console.log(geo.loc2);
            dataObj[`${geo.loc1}${geo.loc1 !== "" ? ", " : ""}${geo.loc2}`] = props.dateIndex >= i ? 
            cases.find(item => 
                item[loc1] === geo.loc1 &&
                item[loc2] === geo.loc2)[date] : null
        })        
        : console.log("no selected geos");
        
        data.push(dataObj);
    });

    const sampleData = data.filter((item, i) =>
        i <= props.dateIndex &&
        i > props.dateIndex - pDuration
    );

    console.log(sampleData);

    // const regressionResults = selectedGeos ? selectedGeos.map(geo => {
    //     const dataArray = [];
    //     console.log(geo);
    //     sampleData.map((data, i) =>
    //         dataArray.push([
    //             i,
    //             data[`${geo.loc1}${geo.loc1 !== "" ? ", " : ""}${geo.loc2}`]
    //         ])  
    //     );
    //     return {
    //         'name': `${geo.loc1}${geo.loc1 !== "" ? ", " : ""}${geo.loc2}`,
    //         'regression': regression.exponential(dataArray)
    //     };
    // }) : null;

    // console.log(regressionResults);

    // projectedDates.forEach((date, i) => {
    //     const dataObj = {
    //         'name': date
    //     };

    //     selectedGeos ? selectedGeos.forEach(geo => 
    //         dataObj[`${geo.loc1}${geo.loc1 !== "" ? ", " : ""}${geo.loc2}`] =
    //         regressionResults.find(result => result.name === 
    //             `${geo.loc1}${geo.loc1 !== "" ? ", " : ""}${geo.loc2}`)
    //             .regression
    //             .predict(i + pDuration)[1]
    //     ) : console.log('no selected geos');

    //     projection.push(dataObj);
    // });

    // console.log(projection);

    const mostCurrentValues = selectedData ?
        selectedData.map(item => 
            props.calcRate ?
            calcRate(
                item[dates[dates.length -1]],
                    props.pops.find(geo =>
                        item[loc1] === geo.loc1 &&
                        item[loc2] === geo.loc2)['Pop2019'],
                    100000) 
            : item[dates[dates.length -1]])
    : null;

    // console.log(mostCurrentValues);

    

    const maxValue = mostCurrentValues ? Math.max(...mostCurrentValues) : props.calcRate ? 5 : 1000;
    
    return (
        <ResponsiveContainer width={'100%'} height={'45%'}>
            <LineChart 
                margin={{
                    top: 40, right: 20, left: 10, bottom: 10,
                    }}
                data={data}>
                {
                    selectedGeos ? selectedGeos.map((geo, i) =>
                        <Line
                          isAnimationActive={false}
                          type={'monotone'}
                          dot={false} 
                          stroke={props.colors[i]}
                          strokeWidth={3}
                        //   label={{fill: props.colors[i], fontSize: 20}} 
                          dataKey={`${geo.loc1}${geo.loc1 !== "" ? ", " : ""}${geo.loc2}`}/>
                        ) : null
                }
                <Tooltip formatter={value => props.calcRate ? 
                    numeral(value).format('0.0')
                    : numeral(value).format('0,0')}/>
                <XAxis type='category' dataKey='name' domain={[dates[0], dates[dates.length - 1]]}/>
                <YAxis
                  tick={{ fontSize: '12'}}
                  tickFormatter={tick => 
                    props.calcRate ?
                    numeral(tick).format('0.0')
                    : numeral(tick).format('0,0')}
                  type='number'
                  orientation='right' 
                  domain={[0, maxValue]}>
                    <Label angle={-90} fontSize={14} dx={0} position='right' style={{ textAnchor: 'middle'}}>
                    {props.calcRate ? `${props.label} per 100K people` : props.label}
              </Label>)    
                </YAxis>
            </LineChart>
        </ResponsiveContainer>
    )
}

export default Chart;