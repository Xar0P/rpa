import * as dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: process.env.ASSEMBLYAI_API_KEY,
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  },
});

assembly
  .post("/transcript", {
    audio_url:
      "https://www.google.com/recaptcha/api2/payload/audio.mp3?p=06AFY_a8Ukt6KZ1eNjG_-PoSyOJecGrjWVmqs1CKaHN39lSp1rLuBJiKDKycTGF2FJSEtlrS2msOFxXmeE4RTynaC65FYe2GnIpzhmBlZTiX-ARcHU7ZsKN-2c7Sv1dyEI1l-CkluxupprWWnXCCDaeSyur4BxWtwPUd2k4ThTr_kQ0pCAmtBfRk9yram3OyFoBd1mv2ANmBKG&k=6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-",
  })
  .then((res) => {
    const { id } = res.data;

    setTimeout(() => {
      assembly
        .get(`/transcript/${id}`)
        .then((res) => console.log(res.data))
        .catch((err) => console.error(err));
    }, 15000);
  })
  .catch((err) => console.error(err));
