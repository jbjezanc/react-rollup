import React, { lazy } from 'react';
import './App.css';
import dogImage from '../../public/dog-img.jpg';
import ButtonComponent from '../shared/Button';
import DashboardComponent from './Dashboard';
// import DynamicComponent from './Dynamic';
const DynamicComponent = lazy(() =>
    import(/* webpackChunkName: 'dynamic-component' */ './Dynamic')
);

export default function AppComponent() {
    console.log('API_URL', 'https://api/v1/graphql');
    const logMessage = () => {
        console.log('hello, I am not referenced anywhere!');
    };
    return (
        <div className="container">
            <div>App Component</div>
            <div>
                <img className="dog" src={dogImage} alt="a dog" />
                <ButtonComponent />
                <DashboardComponent />
                <DynamicComponent />
            </div>
        </div>
    );
}
