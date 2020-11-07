import io from 'socket.io-client'
import { useSelector } from 'react-redux'
import { selectToken } from '../auth/authSlice'

let socket;

export { socket }