import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DB } from '../../../lib';
import Header from '../../shared/Header';
import Footer from '../../shared/Footer';
import TrailsList from '../../shared/TrailsList';
import SearchBar from '../../shared/SearchBar';
import Button from '../../shared/Button';

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            homeTopList: null,
        }
    }

    componentDidMount() {
        DB.ref('trails')
            .orderBy('timestamp', 'desc')
            .get()
            .then(querySnapshot => {
                let trailsData = []
                querySnapshot.forEach(doc => {
                    if (doc.data().title.indexOf(`合歡`) >= 0) {
                        trailsData.push(doc.data())
                    }
                    this.setState({
                        homeTopList: trailsData
                    })
                })
            })
    }

    render() {
        const { homeTopList } = this.state
        console.log(homeTopList)
        if (homeTopList === null) {
            return <div>Home Loading</div>
        }
        return (
            <Fragment>
                <Header history={this.props.history} />
                <section id="home">
                    <div className="home-banner">
                        <div className="home-img">
                            <div className="layer"></div>
                            <img src="https://firebasestorage.googleapis.com/v0/b/meet-trail-right.appspot.com/o/projectPictures%2FhomeBanner%2F%E6%96%B0%E5%B1%B1%E5%A4%A2%E6%B9%96%E6%AD%A5%E9%81%93.jpg?alt=media&token=007a9576-446d-43b1-ae3a-99124a034d35" alt="" />
                        </div>
                        <div className="home-content">
                            <div className="home-title">
                                <h2>遇見最嚮往的山林步道</h2>
                                <p>透過資訊整合與山友分享，尋找最適合前往的步道</p>
                            </div>
                            < SearchBar />
                            <div className="home-btn-container">
                                <Link to="/trails">
                                    <Button
                                        text={'前往全部步道'}
                                        id={'home-btn'}
                                    />
                                </Link>
                                <p></p>
                            </div>
                        </div>
                    </div>
                    <div className="home-web-intro">
                        <div className="flex wrap">
                            <div className="intro-item">
                                <div className="icon">
                                    <i className="fas fa-mountain"></i>
                                </div>
                                <div className="description">
                                    觀看步道週天氣、基本資訊以及社群近況
                            </div>
                            </div>
                            <div className="intro-item">
                                <div className="icon">
                                    <i className="fas fa-info-circle"></i>
                                </div>
                                <div className="description">
                                    獲得山友回報的步道最新近況與步道評論
                            </div>
                            </div>
                            <div className="intro-item">
                                <div className="icon">
                                    <i className="fas fa-edit"></i>
                                </div>
                                <div className="description">
                                    分享喜愛的步道資訊，讓山友有更佳資訊
                            </div>
                            </div>
                        </div>
                    </div>
                    <div className="home-top">
                        <div className="wrap">
                            <div className="home-top-title">
                                <i className="fas fa-hiking"></i>  精選步道輯：合歡山
                            </div>
                            <div className="flex home-top-list">
                                {
                                    homeTopList.map(trail => {
                                        return (
                                            <div className="home-top-item" style={{
                                                backgroundImage: `url(${trail.images.main_image})`
                                            }} key={trail.id}>
                                                <Link to={`/trails/detail/${trail.id}`}>
                                                    <div className="layer"></div>
                                                    <div className="content">
                                                        <h3>{trail.title}</h3>
                                                    </div>
                                                    <div className="flex tag">
                                                        <div className="time">  {
                                                            trail.time > 60 ?
                                                                `${Math.floor(trail.time / 60)} 小時 
                                                    ${trail.time % 60 > 0 ? `${trail.time % 60}分鐘` : ''}`
                                                                : `${trail.time} 分鐘`
                                                        }</div>
                                                        <div className="diffuculty">{trail.difficulty}</div>
                                                        <div className="city">{trail.location.city}</div>
                                                    </div>
                                                </Link>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className="home-trail-list">
                        <div className="wrap">
                            <div className="like-rank">
                                <div className="title"><i className="fas fa-heart"></i> 最多人喜愛</div>
                                < TrailsList trailsList={homeTopList} />
                            </div>
                            <div className="stars-rank">
                                <div className="title"><i className="fas fa-star"></i> 高評價推薦 </div>
                                < TrailsList trailsList={homeTopList} />
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </Fragment>
        )
    }
}

export default Home;