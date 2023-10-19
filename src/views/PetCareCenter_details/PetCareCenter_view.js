
import { Box, Button, Checkbox, Divider, Grid, makeStyles, Table, TableBody, TableCell, TableRow, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { BASE_URL, PATH_PETCARECENTER } from "../../utils/constants";
import makeApiCall from "../../utils/makeApiCall";
import { petCareCenterViewConfig } from "../../utils/display_configuration";
import { useSnackbar } from 'notistack';
import moment from "moment";

const useStyles = makeStyles({
  table: {
    margin: "0 auto",
    width: "90%",
  },
  titleCell: {
    width: "35%",
    textAlign: "right",
    borderBottom: "none",
  },
  valueCell: {
    textAlign: "left",
    borderBottom: "none",
  },
});

const ViewPetCareCenter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const styles = useStyles();

  const [petCareCenter, setPetCareCenter] = useState({});

  useEffect(() => {
    if (id) {
      const fetchPetCareCenterById = async () => {
        const PetCareCenterResponse = await makeApiCall(
          `${BASE_URL}${PATH_PETCARECENTER}(${id})`
        );
        const PetCareCenterJsonResp = await PetCareCenterResponse.json();
        setPetCareCenter(PetCareCenterJsonResp);
      };
      fetchPetCareCenterById();
    }
  }, [id]);

  const paymentStart = async() => {
    console.log("Payment Started");
    try {
      const resp = await makeApiCall(
        `${BASE_URL}/payment/create_order`,
        'POST',
        // JSON.stringify({
        //   ...otherData,
        //   Pincode: parseInt(Pincode),
        // })
      );
      // const jsonResponse = JSON.parse(resp);
      console.log("Resp: ", resp)
      const JsonResp = await resp.json();
      console.log("jsonResponse: ", JsonResp)
      console.log("jsonResponse Id: ", JsonResp.id);
      if (JsonResp.status == "created") {
        let options = {
          key: 'rzp_test_Wm0F71BCeWCa8w',
          amount: JsonResp.amount,
          currency: "INR",
          name: "Replicacia Payment",
          description: "Subscription for CodeWizard",
          image: "https://media.licdn.com/dms/image/C4E0BAQGPsmkslWmKdA/company-logo_200_200/0/1630482306784/replicacia_technologies_pvt_ltd_logo?e=2147483647&v=beta&t=zF6h4T9_sMZDXjDr63RLr8FQP4lDMgZtH7s3HSTZOZs",
          order_id: JsonResp.id,
          handler: async (resp) => {
            resp.order_id = JsonResp.id;
            try {
              const response = await makeApiCall(
                `${BASE_URL}/payment/verify_payment`,
                'POST',
                JSON.stringify(resp)
              );
              snackbar.enqueueSnackbar('Payment Successfull!', {
                variant: 'success',
              });
            } catch (error) {
              snackbar.enqueueSnackbar('Payment Unsuccessfull! Contact Administrator!', {
                variant: 'error',
              });
            }
          },
          // Used for prefilling user data for convenience and greater payment success
          // prefill: {
          //   name: "",
          //   email: "",
          //   contact: ""
          // },
          notes: {
            address: "Replicacia Technologies Private Limited"
          },
          theme: {
            color: "#686CFD",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (resp) {
          console.error(resp.error.code);
          console.error(resp.error.description);
          console.error(resp.error.source);
          console.error(resp.error.step);
          console.error(resp.error.reason);
          console.error(resp.error.metadata.order_id);
          console.error(resp.error.metadata.payment_id);
          snackbar.enqueueSnackbar("Payment Failed!", {
            variant: 'error',
          });
        })
        rzp1.open();
      } else {
        const jsonData = await JsonResp.json();
        snackbar.enqueueSnackbar(`Payment Failed! - ${jsonData.message}`, {
          variant: 'error',
        });
      }
    } catch (error) {
      // Handle any errors that occur during the API calls or processing
      console.error("Error")
      snackbar.enqueueSnackbar(`Error: ${error.message}`, {
        variant: 'error',
      });
    }
  }
  return (
    <>
      {petCareCenter && (
        <Box padding={2}>
          <Grid>
            <Grid item lg={12} xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Typography className="page-heading" variant="h5">View PetCareCenter</Typography>
                <div className="action-buttons">

                  <Button
                    onClick={() => navigate('/PetCareCenters')}
                    variant="contained"
                    color="secondary"
                    size="small"
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </Grid>
            <Divider />
            <Box marginTop={2} className="form-container">
              <Grid container item lg={12} xs={12}>
                {Object.keys(petCareCenterViewConfig).map((config, ind) => (
                  <>
                    <Grid item lg={5} md={5} xs={12}>
                      <Box marginTop={1}>
                        <Typography variant="h6">{config}</Typography>
                        <Table size="small" className={styles.table}>
                          <TableBody>
                            {petCareCenterViewConfig[config].map(
                              ({ key, value, type }) => (
                                <TableRow key={key} className="responsive-table-row">
                                  <TableCell className={[styles.titleCell, 'row-label'].join(' ')}>
                                    <Typography variant="body1">
                                      {value}:{" "}
                                    </Typography>
                                  </TableCell>
                                  <TableCell className={[styles.valueCell, 'row-value'].join(' ')}>
                                    {
                                      type === "date" ? (
                                        <Typography variant="body1">
                                          {petCareCenter[key] !== null &&
                                            moment.utc(petCareCenter[key]).format(
                                              "DD-MMMM-YYYY HH:mm:ss A"
                                            )}
                                        </Typography>
                                      ) :
                                        type === "boolean" ? (
                                          <Checkbox
                                            checked={petCareCenter[key] || false}
                                            disabled
                                          />
                                        ) : (
                                          <Typography variant="body1">
                                            {petCareCenter[key]}
                                          </Typography>
                                        )}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Grid>
                    <Grid item lg={1} md={1} xs={false} />
                  </>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Box>
      )}
      <Divider />
      <div className="center-button" >
        <Button
          onClick={paymentStart}
          variant="contained"
          color="secondary"
          size="small"
        >
          Pay
        </Button>
      </div>
    </>
  );
};

export default ViewPetCareCenter;
