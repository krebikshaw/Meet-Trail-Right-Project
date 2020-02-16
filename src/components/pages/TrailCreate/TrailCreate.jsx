import React, { Component, Fragment } from 'react';
import { DB, APP } from '../../../lib';
import { TC } from '../../../constants';
import { AuthUserContext } from '../../../contexts/AuthUserContext';
import Header from '../../shared/Header';
import Footer from '../../shared/Footer';
import Button from '../../shared/Button';
import Alter from '../../shared/Alert';

class TrailCreate extends Component {
    constructor(props) {
        super(props)
        this.state = TC.initialState
    }

    changeValue = (e) => {
        e.persist()
        const id = e.target.id
        const name = e.target.name
        const value = e.target.value
        if (Number(value)) {
            console.log('isNum')
        } else {
            console.log('isNotNum')
        }

        switch (name) {
            case 'upload-img':
                const file = e.target.files[0]
                const fileTitle = this.state.inputValue.title
                let nameTage
                (id === 'cover-img') ? nameTage = '封面圖' : nameTage = '路線圖'

                // if user not filled title
                if (fileTitle.length < 1) {
                    this.setState(preState => ({
                        alterBox: {
                            ...preState.alertBox,
                            isShow: true,
                            wordHead: '請先輸入',
                            wordTail: '喔',
                            hightlight: '步道名稱'
                        }
                    }))
                } else if (file.size > 8000000) {
                    this.setState(preState => ({
                        alterBox: {
                            ...preState.alertBox,
                            isShow: true,
                            wordHead: '檔案不可超過',
                            wordTail: '喔',
                            hightlight: '8 MB'
                        }
                    }))
                } else {
                    const uploadTask = DB.storageRef(`/trails/${fileTitle}/${fileTitle}${nameTage}`).put(file)
                    uploadTask.on('state_changed', snapshot => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done')
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED: // or 'paused'
                                console.log('Upload is paused');
                                break;
                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                console.log('Upload is running');
                                break;
                        }
                    }, error => {
                        console.log(error)
                    }, () => {
                        // Handle successful uploads on complete
                        uploadTask.snapshot.ref.getDownloadURL()
                            .then(downloadURL => {
                                this.setState(preState => ({
                                    inputValue: {
                                        ...preState.inputValue,
                                        [(nameTage === '封面圖' ? 'coverImg' : 'routeImg')]: downloadURL
                                    }
                                }))
                                console.log('File available at', downloadURL)
                            })
                    })
                }
                break;

            case 'scenery':
                this.setState(preState => ({
                    inputValue: {
                        ...preState.inputValue,
                        [name]: {
                            ...preState.inputValue.scenery,
                            [value]: !preState.inputValue.scenery[value]
                        }
                    }
                }))
                break;

            case 'difficulty':
                this.setState(preState => ({
                    inputValue: {
                        ...preState.inputValue,
                        [name]: {
                            ...preState.inputValue.difficulty,
                            easy: false,
                            general: false,
                            challenge: false,
                            hard: false,
                            [value]: !preState.inputValue.difficulty[value]
                        }
                    }
                }))
                break;
            case 'location':
                switch (id) {
                    case 'area':
                        this.setState(preState => ({
                            inputValue: {
                                ...preState.inputValue,
                                area: value,
                                city: '',
                                dist: ''
                            }
                        }))
                        break;
                    case 'city':
                        this.setState(preState => ({
                            inputValue: {
                                ...preState.inputValue,
                                city: value,
                                dist: ''
                            }
                        }))
                    case 'dist':
                        this.setState(preState => ({
                            inputValue: {
                                ...preState.inputValue,
                                dist: value
                            }
                        }))
                    default:
                        break;
                }
                break;

            default:
                this.setState(preState => ({
                    inputValue: {
                        ...preState.inputValue,
                        [id]: value
                    }
                }))
                break;
        }
    }

    createTrail = () => {
        const { inputValue } = this.state
        const { userData } = this.context
        const { difficultyList, sceneryList } = TC
        const history = this.props.history
        const sceneryData = processRadioOrCheckbox(inputValue.scenery, sceneryList)
        const difficultyData = processRadioOrCheckbox(inputValue.difficulty, difficultyList)

        DB.ref('trails').doc()
            .set({
                id: null,
                title: inputValue.title,
                description: inputValue.description,
                location: {
                    area: inputValue.area,
                    city: inputValue.city,
                    dist: inputValue.dist
                },
                images: {
                    main_image: inputValue.coverImg,
                    route_image: inputValue.routeImg
                },
                routes: {
                    start: inputValue.start,
                    end: inputValue.end,
                    type: inputValue.type
                },
                create_user: {
                    id: userData.id,
                    name: userData.name,
                    picture: userData.picture
                },
                create_time: APP.getDay(),
                height: Number(inputValue.height),
                length: Number(inputValue.length),
                time: (Number(inputValue.hour) * 60) + Number(inputValue.minute),
                scenery: sceneryData,
                difficulty: difficultyData,
                timestamp: DB.time(),
                youtube_list: null
            }).then(() => {
                DB.ref('trails')
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            if (doc.data().id === null) {
                                DB.ref('trails').doc(doc.id)
                                    .update({ id: doc.id })
                                history.push(`/trails/detail/${doc.id}`)
                            }
                        })
                    })
            })

        function processRadioOrCheckbox(keyList, dataList) {
            const trueKeyList = Object.keys(keyList)
                .filter(key => keyList[key])

            const trueNameList = trueKeyList.map(trueKey => {
                for (let i = 0; i < dataList.length; i++) {
                    if (dataList[i].value === trueKey) {
                        return dataList[i].name
                    }
                }
            })

            return trueNameList
        }
    }

    clearAllInput = () => {
        this.setState(preState => ({
            ...preState,
            inputValue: TC.initialState.inputValue,
            alertBox: TC.initialState.alterBox
        }))
    }

    closeAlert = () => {
        this.setState(preState => ({
            alterBox: {
                ...preState.alertBox,
                isShow: false,
                wordHead: '',
                wordTail: '',
                hightlight: ''
            }
        }))
    }

    render() {
        const {
            inputValue,
            alterBox
        } = this.state

        const {
            locationObj,
            difficultyList,
            sceneryList
        } = TC

        console.log(this.state.inputValue)
        return (
            <Fragment>
                <Header />
                <section id="trail-create">
                    <h2>步道資料分享</h2>
                    <div className="wrap">
                        <div>
                            <p className="mark-word"><span className="mark">*</span>為必填</p>
                        </div>

                        <div className="form-item">
                            <label htmlFor="title">步道名稱<span className="mark">*</span></label>
                            <input
                                type="text"
                                id="title"
                                placeholder="請先輸入步道全名"
                                value={inputValue.title}
                                onChange={this.changeValue}
                            />
                        </div>

                        <div className="form-item">
                            <label htmlFor="description">步道簡介<span className="mark">*</span></label>
                            <div className="textarea-wrap">
                                <textarea
                                    id="description"
                                    placeholder="簡要介紹步道的特色"
                                    value={inputValue.description}
                                    onChange={this.changeValue}>
                                </textarea>
                                <p className="words-remider">30 / 150 字</p>
                            </div>
                        </div>

                        <div className="form-item">
                            <label>上傳封面圖片<span className="mark">*</span></label>
                            <div className="flex upload-img-wrap">
                                <label htmlFor="cover-img" className="upload-area cover-img">
                                    <i className="far fa-image">
                                        <p><i className="fas fa-plus-circle"></i>點擊上傳</p>
                                    </i>
                                    <img src={inputValue.coverImg} />
                                    {/* <div className="loading-img-wrap">
                                        <div className="layer"></div>
                                        <div className="loading-img">
                                            <div></div><div></div><div></div><div></div>
                                        </div>
                                    </div> */}
                                </label>
                                <div className="upload-img">
                                    <input type="file"
                                        id="cover-img"
                                        name="upload-img"
                                        onChange={this.changeValue}
                                        accept="image/png,image/jpeg,image/jpg"
                                    />
                                </div>
                                <div className="flex reminder">
                                    <div className="reminder-icon">
                                        <i className="fas fa-exclamation"></i>
                                    </div>
                                    <div className="reminder-content">
                                        <p>1. 此<span>封面圖</span>會呈現在步道頁面最上方</p>
                                        <p>2. 建議圖片尺寸比例為<span> 6 : 9 </span></p>
                                        <p>3. 建議圖片寬度至少大於<span> 800 像素 </span></p>
                                        <p>4. 檔案須小於<span> 8 MB</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-item">
                            <label htmlFor="area">步道位置<span className="mark">*</span></label>
                            <div className="flex">
                                <select
                                    name="location"
                                    id="area"
                                    value={inputValue.area}
                                    onChange={this.changeValue}
                                >
                                    <option
                                        value='選擇區域'
                                        className={`${inputValue.area.length > 0 ? 'inactive' : ''}`}>
                                        選擇區域
                                    </option>
                                    {
                                        Object.keys(locationObj).map(area => {
                                            return <option value={`${area}`}>{area}</option>
                                        })
                                    }
                                </select>
                                <select
                                    name="location"
                                    id="city"
                                    value={inputValue.city}
                                    onChange={this.changeValue}
                                >
                                    <option value='選擇縣市'>選擇縣市</option>
                                    {
                                        inputValue.area.length > 0 ?
                                            Object.keys(locationObj[inputValue.area]).map(city => {
                                                return <option value={`${city}`}>{city}</option>
                                            }) : ''
                                    }
                                </select>
                                <select
                                    name="location"
                                    id="dist"
                                    value={inputValue.dist}
                                    onChange={this.changeValue}
                                >
                                    <option value='選擇鄉鎮'>選擇鄉鎮</option>
                                    {
                                        inputValue.city.length > 0 ?
                                            locationObj[inputValue.area][inputValue.city].map(dist => {
                                                return <option value={`${dist}`}>{dist}</option>
                                            }) : ''
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="form-item">
                            <label htmlFor="route">步道起終點<span className="mark">*</span></label>
                            <div className="flex route">
                                <div className="flex">
                                    <input
                                        type="text"
                                        id="start"
                                        placeholder="起點處"
                                        value={inputValue.start}
                                        onChange={this.changeValue}
                                    />
                                </div>
                                <i className="fas fa-long-arrow-alt-right"></i>
                                <div className="flex">
                                    <input
                                        type="text"
                                        id="end"
                                        placeholder="終點處"
                                        value={inputValue.end}
                                        onChange={this.changeValue}
                                    />
                                </div>
                                <i className="fas fa-mountain"></i>
                                <div className="flex">
                                    <select
                                        name="route"
                                        id="type"
                                        value={inputValue.type}
                                        onChange={this.changeValue}
                                    >
                                        <option value="單向折返">單向折返</option>
                                        <option value="雙向進出">雙向進出</option>
                                        <option value="環狀步道">環狀步道</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-item">
                            <label>步道難度<span className="mark">*</span></label>
                            <div className="flex difficulty-list">
                                {
                                    difficultyList.map(difficultyItem => {
                                        return (
                                            <label className={`flex difficulty ${inputValue.difficulty[difficultyItem.value] ? 'active' : ''}`}>
                                                <input
                                                    id={difficultyItem.value}
                                                    name="difficulty"
                                                    type="radio"
                                                    value={difficultyItem.value}
                                                    onChange={this.changeValue}
                                                    checked={inputValue.difficulty[difficultyItem.value]}
                                                />
                                                <span className="radio-mark"></span>
                                                {difficultyItem.name}
                                            </label>
                                        )
                                    })
                                }
                            </div>
                        </div>

                        <div className="form-item">
                            <label>登頂風景<span className="mark">*</span></label>
                            <div className="flex">
                                <div className="flex scenery-list">
                                    {
                                        sceneryList.map(sceneryItem => {
                                            return (
                                                <label className={`scenery ${inputValue.scenery[sceneryItem.value] ? 'active' : ''}`}>
                                                    <input
                                                        id={sceneryItem.value}
                                                        name="scenery"
                                                        type="checkbox"
                                                        value={sceneryItem.value}
                                                        onChange={this.changeValue}
                                                        checked={inputValue.scenery[sceneryItem.value]}
                                                    />
                                                    {sceneryItem.name}
                                                </label>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="form-item">
                            <label htmlFor="height">海拔高度<span className="mark">*</span></label>
                            <div className="flex height">
                                <input
                                    type="text"
                                    value={inputValue.height}
                                    id="height"
                                    placeholder="最高海拔"
                                    onChange={this.changeValue}
                                />
                                <p>公尺</p>
                            </div>
                        </div>

                        <div className="form-item">
                            <label htmlFor="length">全程里程數<span className="mark">*</span></label>
                            <div className="flex length">
                                <input
                                    type="text"
                                    value={inputValue.length}
                                    id="length"
                                    placeholder="全程多少"
                                    onChange={this.changeValue}
                                />
                                <p>公里</p>
                            </div>
                        </div>


                        <div className="form-item">
                            <label htmlFor="hour">整趟所需時間<span className="mark">*</span></label>
                            <div className="flex time">
                                <div className="flex">
                                    <input
                                        type="text"
                                        id="hour"
                                        placeholder="0"
                                        value={inputValue.hour}
                                        onChange={this.changeValue}
                                    />
                                    <p>小時</p>
                                </div>
                                <div className="flex">
                                    <input
                                        type="text"
                                        id="minute"
                                        placeholder="0"
                                        value={inputValue.minute}
                                        onChange={this.changeValue}
                                    />
                                    <p>分鐘</p>
                                </div>
                            </div>
                        </div>

                        <div className="form-item">
                            <label>上傳步道路線圖</label>
                            <div className="flex upload-img-wrap">
                                <label htmlFor="route-img" className="upload-area route-img">
                                    <i className="far fa-image">
                                        <p><i className="fas fa-plus-circle"></i>點擊上傳</p>
                                    </i>
                                    <img src={inputValue.routeImg} />
                                </label>
                                <div className="upload-img">
                                    <input
                                        type="file"
                                        id="route-img"
                                        name="upload-img"
                                        onChange={this.changeValue}
                                    />
                                </div>
                                <div className="flex reminder">
                                    <div className="reminder-icon">
                                        <i className="fas fa-exclamation"></i>
                                    </div>
                                    <div className="reminder-content">
                                        <p>1. 此<span>步道路線圖</span>，呈現在步道頁面<span>路線資訊</span>處</p>
                                        <p>2. 建議圖片尺寸比例為<span> 6 : 9 </span></p>
                                        <p>3. 建議圖片寬度至少大於<span> 800 像素 </span></p>
                                        <p>4. 檔案須小於<span> 8 MB</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="confirm-btns">
                            <Button
                                text={'確認送出'}
                                id={'confirm-create-btn'}
                                onClick={this.createTrail}
                            />
                            <Button
                                text={'清空全部'}
                                id={'clear-all-btn'}
                                onClick={this.clearAllInput}
                            />
                        </div>
                    </div>
                </section>
                <Alter
                    isShow={alterBox.isShow}
                    wordHead={alterBox.wordHead}
                    wordTail={alterBox.wordTail}
                    hightlight={alterBox.hightlight}
                    onClick={this.closeAlert}
                />
                <Footer />
            </Fragment>
        )
    }
}

TrailCreate.contextType = AuthUserContext;
export default TrailCreate;