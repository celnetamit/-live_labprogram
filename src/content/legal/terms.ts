import { COMPANY, LEGAL_LAST_UPDATED } from "./company";
import type { LegalDocument } from "./types";

/**
 * The operator's Terms and Conditions, transcribed from
 * nanoschool.in/terms-of-service/.
 *
 * All thirteen numbered clauses are reproduced in the operator's own wording
 * and order, including the clause numbering, because a gateway compares this
 * against what the company publishes elsewhere. "the Website" is read as
 * live-labs.org and the laboratories reached from it — the only substantive
 * edit, and a necessary one, since terms naming a different website do not
 * govern this one.
 *
 * A closing clause specific to the laboratories is appended. It is marked as
 * such below and is not part of the transcription.
 */
export const TERMS: LegalDocument = {
  title: "Terms and Conditions",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: [
    `This Website User Agreement and the Privacy Policy lays out the terms and conditions and rules, as maybe amended and supplemented, from time to time (hereinafter referred to as the “Agreement”) which shall be applicable to the access and use of the website live-labs.org and the laboratories reached from it (owned and managed by ${COMPANY.legalName}) hereby referred as “Company”, by the visitor/user (“User”) of the Website.`,
  ],
  sections: [
    {
      heading: "1. Acceptance of Terms and Modification Thereof",
      paragraphs: [
        "1.1 Access of the Website by the User constitutes an acknowledgement and acceptance in full, of all the terms, conditions and notices as stated in this Agreement and without any modification and/or exception by the User of this Agreement. If the User does not agree with any part of such terms, conditions and notices as stated in this Agreement in any manner, the User must not access the Website.",
        "1.2 Company reserves the right to change the terms, conditions and notices pursuant to which the Website is accessed by the User, without any notice or intimation of such change.",
      ],
    },
    {
      heading: "2. Limited User",
      paragraphs: [
        "2.1 The User agrees that given the nature of the Internet, even though the Website is targeted to Indian Residents only, it may be accessed in other parts of the world. The material/information on this Website is not intended for use by persons located in, or residents in countries that restrict the distribution of such material/information or by any person in any jurisdiction where distribution or use of such material/information or usage or access of Website will be contrary to law or any regulation. It shall be the responsibility of every User to be aware of and fully observe the applicable laws and regulations of the jurisdiction which User is subject of. If the User is not an Indian resident and yet uses this Website, he acknowledges, understands and agrees that he is doing so on his own initiative and at his own risk and Company shall not be liable for violation/breach of any of the laws applicable to usage of the Website. The Website is not to be and should not be construed as purporting to offer or inviting to offer any information to residents of countries where Company is not licensed or authorized to perform activities related to its objective.",
        "2.2 The User further agrees and undertakes not to reverse engineer, modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products, services or intellectual property obtained from the Website in any manner whatsoever. Reproduction, copying of the content for commercial or non-commercial purposes and unwarranted modification of data and information within the content of the Website is strictly not permitted without prior written consent from Company and/or third party owners. However, some of the content of our services or other files may be made available for download from the website which is permitted to be copied and/or used only for personal purposes of the User. The User and/or any third party is prohibited from running or displaying this Website and/or information displayed on this Website on any other Website or frames, without prior written consent from Company.",
      ],
    },
    {
      heading: "3. Disclaimer of Warranties",
      paragraphs: [
        "3.1 Company has endeavored to ensure that all the information provided by it on this Website is correct, but it neither warrants nor makes any representations regarding the quality, accuracy or completeness of any data or information displayed on this Website and Company shall not be, in any manner liable for inaccuracy/error if any. Company makes no warranty, express or implied, concerning the Website and/or its contents and disclaims all warranties of fitness for a particular purpose and warranties of merchantability in respect of information displayed and communicated through or on the Website, including any liability, responsibility or any other claim, whatsoever, in respect of any loss, whether direct or consequential, to any User or any other person, arising out of or from the use of any such information as is displayed or communicated through or on the Website or the provision of the Services.",
        "3.2 Company shall not be held responsible for non-availability of the Website at any point in time for any reason whatsoever. The User understands and agrees that any material and/or data downloaded or otherwise obtained from Company through the Website is done entirely at his discretion and risk and he will be solely responsible for any damage to his computer systems or any other loss that results from such material and/or data.",
      ],
    },
    {
      heading: "4. Links to Third Party Sites",
      paragraphs: [
        "4.1 The Website may contain links to other websites or may contain features of any nature of other websites on the Website (“Linked Sites”). The Linked Sites are not under the control of Company or the Website and Company is not responsible for the contents of any Linked Site, including without limitation any link or advertisement contained in a Linked Site, or any changes or updates to a Linked Site. Company is not responsible for any form of transmission, whatsoever, received by the User from any Linked Site. The inclusion of any link does not imply endorsement of any nature by Company or the Website of the Linked Sites or any association with its operators or owners.",
        "4.2 Company will be making calls and sending SMS through a third-party platform after the User’s registration in order to provide our service. The User’s registration means acceptance of the service.",
        "4.3 Company is not responsible for any errors, inclusions, omissions or representations on any Linked Site, or on any link contained in a Linked Site. The User is requested to verify the accuracy of all information on his own before undertaking any reliance on such information of such products/services that they believe may benefit the User.",
      ],
    },
    {
      heading: "5. User’s Obligations",
      paragraphs: [
        "5.1 As a condition of access and use of the Website, the User warrants that he will not use the Website for any purpose that is unlawful or illegal under any law for the time being in force within or outside India or prohibited by this Agreement. In addition, the Website shall not be used in any manner, which could damage, disable, overburden or impair it or interfere with any other party’s use and/or enjoyment of the Website or infringe any intellectual property rights of Company or any third party.",
      ],
    },
    {
      heading: "6. Contact Us Feature",
      paragraphs: [
        "6.1 The Users will be provided with Contact Us features on the Website. The Users will be able to provide their contact details to enable Company to contact them.",
        "6.2 The Users may further be provided with features to contact Company, raise queries, comments or interact with Company. However Company shall be at its sole discretion and be within its rights to answer, reply or opt not to reply to any such queries or comments.",
        "6.3 By using the said features, User permits Company to contact them on their registered details, for any clarification or to offer any other service from time to time.",
      ],
    },
    {
      heading: "7. Breach",
      paragraphs: [
        "7.1 Without prejudice to the other remedies available to Company under this Agreement or under applicable law, Company may limit the User’s activity, warn other Users of the User’s actions, immediately temporarily/indefinitely suspend or terminate the User’s use of the Website, and/or refuse to provide the User with access to the Website if the User is in breach of this Agreement.",
      ],
    },
    {
      heading: "8. Ownership and Proprietary Rights",
      paragraphs: [
        "8.1 The content of the Website and all copyrights, patents, trademarks, service marks, trade names and all other intellectual property rights therein are owned by Company or validly licensed to Company and are protected by applicable Indian and international copyright and other intellectual property law. The User acknowledges, understands and agrees that he shall not have, nor be entitled to claim, any rights in and to the Website content and/or any portion thereof.",
        "8.2 Some of the content on the Website have been permitted by the third party/ies to be used by Company in such form and manner as may be desired by Company and Company will make its best endeavors to give credit to such third party/ies during publication of such content on its Website. If at any point in time any dispute is raised with respect to publication of such content, by any third party, Company shall be in its rights to remove such content or procure requisite consents from third party/ies.",
        "8.3 Any copyrighted or other proprietary content distributed on or through the Website with the consent of the owner must contain the appropriate copyright or other proprietary rights notice. The unauthorized submission or distribution of copyrighted or other proprietary content is illegal and could subject the User to personal liability or criminal prosecution.",
      ],
    },
    {
      heading: "9. Limitation of Liability",
      paragraphs: [
        "9.1 The User understands and expressly agrees that to the extent permitted under applicable laws, in no event will the Company or any of its affiliates or parent company or any of their respective officers, employees, directors, shareholders, agents, or licensors be liable to the User or anyone else under any theory of liability (whether in contract, tort, statutory, or otherwise) for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of revenues, profits, goodwill, use, data or other intangible losses (even if such parties were advised of, knew of or should have known of the possibility of such damages), resulting from the User’s use of or inability to use the Website or any parts thereof.",
      ],
    },
    {
      heading: "10. Indemnification",
      paragraphs: [
        "10.1 The User agrees to indemnify, defend and hold harmless Company, its affiliates, group companies and their directors, officers, employees, agents, third party service providers, and any other third party providing any service to Company in relation to the Website whether directly or indirectly, from and against any and all losses, liabilities, claims, damages, costs and expenses (including legal fees and disbursements in connection therewith and interest chargeable thereon) asserted against or incurred by Company that arise out of, result from, or may be payable by virtue of, any breach or non-performance of any terms of this Agreement including any representation, warranty, covenant or agreement made or obligation to be performed by the User pursuant to this Agreement.",
      ],
    },
    {
      heading: "11. Severability",
      paragraphs: [
        "11.1 If any provision of this Agreement is determined to be invalid or unenforceable in whole or in part, such invalidity or unenforceability shall attach only to such provision or part of such provision and the remaining part of such provision and all other provisions of this Agreement shall continue to be in full force and effect.",
      ],
    },
    {
      heading: "12. Force Majeure",
      paragraphs: [
        "12.1 Company shall not be liable for any failure to perform any of its obligations under this Agreement or provide the Services or any part thereof if the performance is prevented, hindered or delayed by a Force Majeure Event and in such case its obligations shall be suspended for so long as the Force Majeure Event continues.",
      ],
    },
    {
      heading: "13. Governing Law",
      paragraphs: [
        "13.1 This Agreement shall be governed by and construed in accordance with the laws of India without reference to conflict of laws principles. In the event any dispute in relation hereto is brought by the User, it shall be subject to the exclusive jurisdiction of the courts of Delhi, India.",
      ],
    },
    {
      /*
       * Not part of the transcription. The operator's terms were written for a
       * website and for live workshops; this platform additionally runs
       * simulation laboratories, and a learner is entitled to be told plainly
       * that a simulated result is not a measured one before they rely on it.
       */
      heading: "14. Use of the Laboratories",
      paragraphs: [
        "14.1 The laboratories on this platform are teaching instruments. Their models, simulations, predicted values and generated reports are produced for education and training, and are not a substitute for laboratory measurement, clinical judgement, regulatory assessment or professional engineering advice.",
        "14.2 The User agrees not to rely on any output of a laboratory as the basis for a real-world scientific, medical, safety, financial or commercial decision, and not to represent a simulated result as an experimental one.",
        "14.3 Where a laboratory uses an artificial intelligence model to explain or narrate a result, that explanation may be incomplete or wrong. The computed result, and the stated method that produced it, take precedence over any generated commentary.",
      ],
    },
  ],
};
