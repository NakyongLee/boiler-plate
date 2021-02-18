import React, { useEffect, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action'
export default function (SpecificComponent, option, adminRoute = null) { //admin에 대한 기본값이 null인 것(es6문법)

    //null : 아무나
    //true : login한 유저만
    //false : login한 유저는 출입 불가
    function AuthenticationCheck(props) {

        const dispatch = useDispatch();
        useEffect(() => {
            dispatch(auth()).then(response => {
                console.log(response)
                //로그인 하지 않은 상태
                if (!response.payload.isAuth) {
                    if (option === true) {
                        props.history.push('/login')
                    }
                } else {
                    //로그인한 상태
                    if (adminRoute === true && !response.paylad.isAdmin) {
                        props.history.push('/')
                    } else {
                        if (option === false) {
                            props.history.push('/')
                        }
                    }
                }
            })
        })
        return (
            <SpecificComponent />
        )
    }
    return AuthenticationCheck
}