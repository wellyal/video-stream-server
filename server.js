const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/video', (req, res) => {
	const path = 'assets/test.mp4'	
	const fileSize = fs.statSync(path).size
	const range = req.headers.range

	if ( range ) {
		const parts = range.replace(/bytes=/, '').split('-')
		const start = parseInt(parts[0], 10)
		const end = parts[1] 
			? parseInt(parts[1], 10)
			: fileSize - 1

		const chunkSize = (end - start) + 1
		const file = fs.createReadStream(path, {start, end})
		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunkSize,
			'Content-Type': 'video/mp4',
		}

		res.writeHead(206, head)
		file.pipe(res)
	} else {
		const head = {
			'Content-Length': fileSize,
			'Content-Type': 'video/mp4'
		}

		res.writeHead(200, head)
		fs.createReadStream(path).pipe(res)
	}
})

app.listen(3000, () => {
	console.log('Listening on port 3000!')
})
