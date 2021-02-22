const express = require('express');
const jwt = require('jsonwebtoken');
const os = require('os');

//Models
const getConnection = require('../../../models/createPool');
const getQuery = require('../../../models/createQuery');

//Service
const {
    getCpuUsage,
    byteToGigabyte
} = require('../../../services');

const router = express.Router();

const authCredentials = (req, res, next) => {
    const accessToken = req.cookies.access_token,
          loginPageURL = '/admin/login',
          logoutURL = '/admin/logout';

    if(!accessToken){
        res.redirect(loginPageURL);

        res.end();
    }else{
        jwt.verify(accessToken, process.env.SECRET, (err) => {
            if(err){
                res.redirect(logoutURL);

                res.end();
            }else{
                next();
            };
        });
    };
};

router.get('/', authCredentials, async (req, res) => {
    if(req.query.q){
        if(req.query.q === "all"){
            getConnection(async (error, connection) => {
                if(!error && connection){
                    connection.query("SELECT table_name FROM information_schema.tables WHERE table_schema = ?", [process.env.DATABASE_NAME], async (error, result) => {
                        if(!error && result){
                            const tableList = [],
                                  freeMemory = os.freemem(),
                                  totalMemory = os.totalmem();
                            
                            result.forEach(currentTable => {
                                tableList.push(currentTable.table_name);
                            });

                            res.status(200).json({
                                success: true,
                                systemStatus: {
                                    cpu: {
                                        usedPercentage: getCpuUsage(os.cpus())
                                    },
                                    memory: {
                                        used: byteToGigabyte(totalMemory - freeMemory),
                                        total: byteToGigabyte(totalMemory)
                                    }
                                },
                                databaseStatus: {
                                    tableList: tableList
                                } 
                            });
                        }else{
                            res.status(500).json({
                                success: false,
                                description: 'Server error, please try again'
                            });
                        };
                    });
    
                    connection.release();
                }else{
                    res.status(500).json({
                        success: false,
                        description: 'Server error, please try again'
                    });
                };
            });
        }else{
            res.status(200).json({
                success: false,
                description: "Invalid query value"
            });
        };
    }else{
        if(Object.entries(req.query).length > 0){
            res.status(200).json({
                success: false,
                description: "Invalid query parameter"
            });
        }else{
            res.sendFile('./public/dashboard.html', {root: './'});
        };
    };
});

module.exports = router;