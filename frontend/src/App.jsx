import React, { useState, useEffect } from 'react';
import GaugeComponent from 'react-gauge-component';
import ReactApexChart from 'react-apexcharts';
import { IoInformationCircleSharp } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FsLightbox from "fslightbox-react";
import Popup from 'reactjs-popup';
import './App.css';

const ApexBarChart = ({ data, timestamps }) => {
  const [chartData, setChartData] = useState({
    series: [{
      name: "AQI",
      data: data,
    }],
    options: {
      chart: {
        height: 350,
        type: 'bar',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 500,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 500
          }
        },
        toolbar: {
          export: {
            svg: {
              filename: 'air-quality-data',
            },
            png: {
              filename: 'air-quality-data',
            }
          },
          autoSelected: 'zoom' 
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        title: {
          text: "Time (Per 30 Seconds)",
          style: {
            color: '#000',
          },
        },
        categories: timestamps,
        labels: {
          style: {
            colors: ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
          },
        },
      },
      yaxis: {
        title: {
          text: 'Air Quality (PPM)',
          style: {
            color: '#000',
          },
        },
        labels: {
          style: {
            colors: ['#000'],
          },
        },
      },
      title: {
        text: 'Air Quality Data',
        align: 'center',
        margin: 20,
        offsetY: 20,
        style: {
          fontSize: '25px',
          color: '#000'
        },
      },
    },
  });

  useEffect(() => {
    setChartData(prevState => ({
      ...prevState,
      series: [{ data: data }],
    }));
    console.log(data)
  }, [data]);

  useEffect(() => {
    setChartData(prevState => ({
      ...prevState,
      options: {
        ...prevState.options,
        xaxis: {
          ...prevState.options.xaxis,
          categories: timestamps,
        },
      },
    }));
    console.log(timestamps)
  }, [timestamps]);

  return (
    <div>
      <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
    </div>
  );
};

function App() {
  const [airQuality, setAirQuality] = useState(0);
  const [airQualityData, setAirQualityData] = useState(Array(10).fill(0));
  const [timestamps, setTimestamps] = useState(Array(10).fill(''));

  const [isOn, setIsOn] = useState(true);
  const [toggler, setToggler] = useState(false)
  const [isNodeOn, setIsNodeOn] = useState(true)
  const [isNodeOff, setIsNodeOff] = useState(true)

  const [toast50Shown, setToast50Shown] = useState(false);
  const [toast100Shown, setToast100Shown] = useState(false);
  const [toast300Shown, setToast300Shown] = useState(false);
  const [toast500Shown, setToast500Shown] = useState(false);
  const [toast700Shown, setToast700Shown] = useState(false);

  useEffect(() => {
    const fetchAirQuality = async () => {
      try {
        if (isOn) {
          const response = await fetch('https://airpbackend.netlify.app/.netlify/functions/airquality');
          if (!response.ok) {
            throw new Error('Failed to fetch air quality data');
          }
          const data = await response.json();
          setAirQuality(data.airQuality);

          if(data.airQuality == 0 && isNodeOff) {
            toast.error('Please Connect the NodeMCU')
            setIsOn(false)
            setIsNodeOff(false)
          }

          if (data.airQuality == 0 && !isNodeOff) {
            toast.error('Oops, something went wrong. Please wait.')
            setIsOn(false)
          }

          const currentTime = new Date();
          const twoMinutesAgo = new Date(currentTime.getTime() - 2 * 60 * 1000);

          if (data.airQuality > 0 && data.airQuality < 100 && !toast50Shown && currentTime > twoMinutesAgo) {
            toast.success("Air quality is Good.");
            setToast50Shown(true);
          }
          if (data.airQuality > 100 && data.airQuality < 300 && !toast100Shown && currentTime > twoMinutesAgo) {
            toast.warn("Air quality is Stable.");
            setToast100Shown(true);
          }
          if (data.airQuality > 300 && data.airQuality < 400 && !toast300Shown && currentTime > twoMinutesAgo) {
            toast.error("Air quality is Bad!!!");
            setToast300Shown(true);
          }
          if (data.airQuality > 400 && data.airQuality < 600 && !toast500Shown && currentTime > twoMinutesAgo) {
            toast.error("WARNING !!! Air quality is Very Bad.");
            setToast500Shown(true);
          }
          if (data.airQuality > 600 && !toast700Shown && currentTime > twoMinutesAgo) {
            toast.error("WARNING !!! Air quality is very Critical.");
            setToast700Shown(true);
          }

        } else {

          const response = await fetch('https://airpbackend.netlify.app/.netlify/functions/airquality');
          const data = await response.json();


          if (data.airQuality > 0 && isNodeOn) {
            toast.success('Connected to the NodeMCU')
            setIsOn(true)
            setIsNodeOn(false)
          }

          if (data.airQuality > 0 && !isNodeOn) {
            toast.success('Everything is working smoothly.')
            setIsOn(true)
          }

          setToast50Shown(false);
          setToast100Shown(false);
          setToast300Shown(false);
          setToast500Shown(false);
          setToast700Shown(false);
        }
      } catch (error) {
        console.error(error)
        toast.error(error)
      }
    };

    const intervalId = setInterval(fetchAirQuality, 1000);
    return () => clearInterval(intervalId);
  }, [isOn, toast50Shown, toast100Shown, toast300Shown, toast500Shown, toast700Shown]);

  useEffect(() => {
    const resetToastFlags = setInterval(() => {
      setToast50Shown(false);
      setToast100Shown(false);
      setToast300Shown(false);
      setToast500Shown(false);
      setToast700Shown(false);
    }, 2 * 60 * 1000);
    return () => clearInterval(resetToastFlags);
  }, []);

  useEffect(() => {
    const fetchAirQualityData = async () => {
      try {
        if (isOn) {
          const response = await fetch('https://airpbackend.netlify.app/.netlify/functions/airquality');
          if (!response.ok) {
            throw new Error('Failed to fetch air quality data');
          }
          const data = await response.json();

          setAirQualityData(prevData => {
            const newData = [data.airQuality, ...prevData.slice(0, prevData.length - 1)];
            return newData;
          });

          setTimestamps(prevTimestamps => {
            const currentTime = new Date();
            const newTimestamps = [currentTime.toLocaleTimeString(), ...prevTimestamps.slice(0, prevTimestamps.length - 1)];
            return newTimestamps;
          });
        } else {
          setAirQualityData(Array(10).fill(0));
          setTimestamps(Array(10).fill(''));
        }
      } catch (error) {
        console.error(error)
        toast.error(error)
      }
    };

    const intervalId = setInterval(fetchAirQualityData, 30000);
    return () => clearInterval(intervalId);
  }, [isOn]);


  return (
    <div className="app">
      <header className="app-header">
        <div className='title-desc'>
          <h1>Air Quality Monitoring System</h1>
          <p>The higher the AQI number, the greater the level of air pollution and the greater the health concern</p>
        </div>
        <div className='gauge-info'>
          <div className="gauge-container">
            <div className="gauge">
              <GaugeComponent
                value={airQuality}
                type="radial"
                minValue={0}
                maxValue={1000}
                labels={{
                  tickLabels: {
                    type: 'outer',
                    ticks: [
                      { value: 100 }, { value: 200 }, { value: 300 }, { value: 400 }, { value: 500 }, { value: 600 }, { value: 700 }, { value: 800 }, { value: 900 }, { value: 1000 },
                    ],
                    defaultTickValueConfig: {
                      style: {
                        fontSize: "15px",
                        fill: "#fff"
                      }
                    }
                  },
                }}
                arc={{
                  colorArray: ['#5BE12C', '#EA4228'],
                  subArcs: [
                    { limit: 100 }, { limit: 200 }, { limit: 300 }, { limit: 400 }, { limit: 500 }, { limit: 600 }, { limit: 700 }, { limit: 800 }, { limit: 900 }, { limit: 1000 },
                  ],
                  padding: 0.02,
                  width: 0.3,
                }}
                pointer={{
                  elastic: true,
                  animationDelay: 0,
                  color: '#fff'
                }}
              />
              <p className="air-p">Air Quality: <b>{airQuality}</b> PPM</p>
            </div>
            <div className="power-btn">
              <div className="p-btn" onClick={() => setToggler(!toggler)}>
                <img src="/project.jpg" alt="" />
              </div>
              <FsLightbox
                toggler={toggler}
                sources={[
                  "/project.jpg",
                ]}
              />
              <div className="p-btn-desc">
                <Popup trigger={<button> <IoInformationCircleSharp color='#d00000' size={30} /></button>} position="left center">
                  <div className='credit'>
                  <h3>This project is made by: </h3>
                    <div className="credit-name">
                      <p>1. BISWAJIT MONDAL (16900320126)</p>
                      <p>2. SOUMOJIT KOLEY (16900320136)</p>
                      <p>3. ANURAN BHATTACHARJEE (16900320137)</p>
                      <p>4. KOMAL PRASAD (16902820017)</p>
                      <p>5. WRITWICKA MITRA (16902820025)</p>
                    </div>
                    <div className='credit-mentor'>
                      <h3>Under the guidance of</h3>
                      <h2>AMIT KUMAR NANDI</h2>
                    </div>
                  </div>
                </Popup>
              </div>
            </div>
          </div>
          <div className="info">
            <div className="info-part1">
              <div className="each-info">
                <div className="each-info-img">
                  <img src="/logo/good.png" alt="" />
                </div>
                <div className="each-info-info">
                  <p>Good (0-50)</p>
                  <p className='info-c1'>NO RISK AT ALL!</p>
                  <ul>
                    <li>Enjoy your day!</li>
                  </ul>
                </div>
              </div>
              <div className="each-info">
                <div className="each-info-img">
                  <img src="/logo/no-risk.png" alt="" />
                </div>
                <div className="each-info-info">
                  <p>Satisfactory (51-100)</p>
                  <p className='info-c2'>NO RISK</p>
                  <ul>
                    <li>Enjoy your day!</li>
                  </ul>
                </div>
              </div>
              <div className="each-info">
                <div className="each-info-img">
                  <img src="/logo/mod.png" alt="" />
                </div>
                <div className="each-info-info">
                  <p>Moderate (101-200)</p>
                  <p className='info-c3'>MINOR HEALTH CONCERN!</p>
                  <ul>
                    <li>If you are sensitive, don't exert yourself!</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="info-part2">
              <div className="each-info">
                <div className="each-info-img">
                  <img src="/logo/poor.png" alt="" />
                </div>
                <div className="each-info-info">
                  <p>Poor (201-300)</p>
                  <p className='info-c4'>ELDERLY AT RISK!</p>
                  <ul>
                    <li>People with Heart, Lung conditions at Risk.</li>
                    <li>Reduce long or heavy exertion and outdoor activity.</li>
                    <li>Healthy may experience discomfort too.</li>
                  </ul>
                </div>
              </div>
              <div className="each-info">
                <div className="each-info-img">
                  <img src="/logo/v-poor.png" alt="" />
                </div>
                <div className="each-info-info">
                  <p>Very Poor (301-400)</p>
                  <p className='info-c5'>HEALTH ALERT!</p>
                  <ul>
                    <li>All may experience health effects.</li>
                    <li>Significant increase in respiratory problems</li>
                    <li>All should reduce Heavy exertion.</li>
                  </ul>
                </div>
              </div>
              <div className="each-info">
                <div className="each-info-img">
                  <img src="/logo/severe.png" alt="" />
                </div>
                <div className="each-info-info">
                  <p>{`Severe (401-500 && > 501)`}</p>
                  <p className='info-c6'>EMERGENCY!</p>
                  <ul>
                    <li>All should avoid any outdoor activity.</li>
                    <li>Stay Indoors.</li>
                    <li>Serious health impact for ALL</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="chart-container">
          <ApexBarChart data={airQualityData} timestamps={timestamps} />
        </div>
      </header>
      <ToastContainer
        className='toast'
        theme="colored"
        autoClose={6000}
      />
    </div>
  );
}

export default App;
