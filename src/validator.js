const {spawn} = require('child_process')
const report = spawn('pyshacl', ['--shacl',`${process.cwd()}\\files\\rulebook.ttl`,`${process.cwd()}\\files\\LBDFile.ttl`])

report.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

report.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });



{/* 
const { exec } = require('child_process')
// pyshacl -s C:\\Users\\emman\\OneDrive\\Documenten\\'21-'22\\Thesis\\rulebooks\\rulebook.ttl -m -i rdfs -a -j -f human C:\\Users\\emman\\OneDrive\\Documenten\\'21-'22\\Thesis\\modeldump\\bibliotheekEdegem.ttl

const data = "C:\\Users\\emman\\Documents\\theesbackend\\files\\LBDFile.ttl"
const shapes = "C:\\Users\\emman\\Documents\\theesbackend\\files\\rulebook.ttl"

exec(`pyshacl -s [${shapes}] -sf turtle -m -i rdfs -a -d -j -f human ${data}`, (error, stdout, stderr) => {
    if(error) {
        console.log(`error: ${error.message}`)
        return
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
    }
    console.log(`stdout: ${stdout}`)
})
*/}