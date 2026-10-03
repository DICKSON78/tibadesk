<?php

namespace Database\Seeders;

use App\Models\Marketing\BlogPost;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        // Seeding this twice used to abort on the first duplicate slug or name,
        // which meant the sample data below it never landed on a re-run.
        if (BlogPost::query()->exists()) {
            return;
        }

        $posts = [
            [
                'title' => 'Understanding Cataracts: Symptoms, Causes, and Treatment Options',
                'slug' => 'understanding-cataracts-symptoms-causes-treatment',
                'excerpt' => 'Cataracts are a common eye condition that affects millions worldwide. Learn about the early warning signs, what causes them, and the available treatment options at Best Vision Eye Care.',
                'content' => '<h2>What Are Cataracts?</h2>
<p>A cataract is a cloudy area in the lens of the eye that leads to a decrease in vision. It is the most common cause of vision loss in people over age 40 and is the principal cause of blindness in the world.</p>

<h2>Symptoms to Watch For</h2>
<p>Cataracts typically develop slowly. Early symptoms include:</p>
<ul>
<li>Blurry or cloudy vision</li>
<li>Difficulty seeing at night</li>
<li>Sensitivity to light and glare</li>
<li>Fading or yellowing of colors</li>
<li>Double vision in a single eye</li>
<li>Frequent changes in eyeglass prescription</li>
</ul>

<h2>What Causes Cataracts?</h2>
<p>The lens of the eye is mostly water and protein. As we age, the protein can clump together and cloud a small area of the lens. Over time, this cloudiness may grow larger and make it harder to see. Risk factors include:</p>
<ul>
<li>Advancing age</li>
<li>Diabetes</li>
<li>Excessive exposure to sunlight</li>
<li>Smoking</li>
<li>Obesity</li>
<li>High blood pressure</li>
<li>Previous eye injury or inflammation</li>
</ul>

<h2>Treatment Options at Best Vision</h2>
<p>At Best Vision Eye Care, we offer comprehensive cataract evaluations and treatment. Surgery is the only effective treatment for cataracts, and it is one of the safest and most successful surgical procedures performed today. Our experienced ophthalmologists use modern techniques to remove the cloudy lens and replace it with an artificial lens, restoring clear vision.</p>
<p>If you are experiencing any of the symptoms mentioned above, schedule an appointment with us today for a thorough eye examination.</p>',
                'category' => 'Eye Conditions',
                'tags' => 'cataracts, eye surgery, vision loss, lens replacement',
                'featured_image' => 'https://picsum.photos/seed/cataracts/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(2),
            ],
            [
                'title' => '5 Essential Tips for Maintaining Healthy Eyes and Clear Vision',
                'slug' => '5-essential-tips-healthy-eyes-clear-vision',
                'excerpt' => 'Your eyes are your window to the world. Discover five practical, everyday habits that can help preserve your vision and keep your eyes healthy for years to come.',
                'content' => '<h2>1. Eat a Balanced Diet Rich in Eye-Friendly Nutrients</h2>
<p>What you eat directly impacts your eye health. Foods rich in omega-3 fatty acids, lutein, zinc, and vitamins C and E can help ward off age-related vision problems. Include plenty of leafy greens, salmon, eggs, nuts, and citrus fruits in your diet.</p>

<h2>2. Protect Your Eyes from UV Rays</h2>
<p>Just as sunscreen protects your skin, quality sunglasses protect your eyes. Prolonged exposure to ultraviolet (UV) radiation increases your risk of cataracts and macular degeneration. Always wear sunglasses that block 99-100% of UVA and UVB radiation when outdoors.</p>

<h2>3. Follow the 20-20-20 Rule</h2>
<p>If you spend long hours in front of a computer screen, your eyes can become strained. The 20-20-20 rule is simple: every 20 minutes, look at something 20 feet away for at least 20 seconds. This reduces eye strain and helps maintain comfortable vision.</p>

<h2>4. Schedule Regular Eye Exams</h2>
<p>Many eye conditions show no early symptoms. Regular comprehensive eye exams can detect problems like glaucoma, diabetic retinopathy, and macular degeneration in their earliest stages when treatment is most effective. Adults should have an eye exam at least every two years.</p>

<h2>5. Quit Smoking or Never Start</h2>
<p>Smoking is one of the worst things you can do for your eye health. It significantly increases the risk of cataracts, macular degeneration, and optic nerve damage. Quitting smoking at any age can help protect your eyes from these serious conditions.</p>
<p>Visit Best Vision Eye Care in Natta-Mwanza for your next comprehensive eye examination. Our team is dedicated to helping you maintain clear, healthy vision throughout your life.</p>',
                'category' => 'Eye Health',
                'tags' => 'eye health, tips, prevention, nutrition, UV protection',
                'featured_image' => 'https://picsum.photos/seed/eye-tips/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(5),
            ],
            [
                'title' => 'Children\'s Vision: When to Schedule Your Child\'s First Eye Exam',
                'slug' => 'childrens-vision-first-eye-exam-guide',
                'excerpt' => 'Good vision is critical for a child\'s learning and development. Learn when to schedule that all-important first eye exam and what signs may indicate your child needs one sooner.',
                'content' => '<h2>Why Children\'s Eye Health Matters</h2>
<p>Vision plays an important role in a child\'s physical, cognitive, and social development. Undiagnosed vision problems can lead to difficulties in school, sports, and daily activities. The good news is that most childhood vision problems are treatable when caught early.</p>

<h2>When Should Your Child Have Their First Eye Exam?</h2>
<p>At Best Vision Eye Care, we recommend the following schedule:</p>
<ul>
<li><strong>6 months:</strong> First comprehensive eye exam</li>
<li><strong>Age 3:</strong> Second eye exam</li>
<li><strong>Before first grade (age 5-6):</strong> Third eye exam</li>
<li><strong>Every 1-2 years:</strong> Regular exams throughout school years</li>
</ul>

<h2>Signs Your Child May Need an Eye Exam Sooner</h2>
<p>Watch for these warning signs:</p>
<ul>
<li>Sitting too close to the television or holding books very close</li>
<li>Frequent eye rubbing</li>
<li>Complaints of headaches or tired eyes</li>
<li>Covering one eye or tilting the head</li>
<li>Squinting or blinking excessively</li>
<li>Avoiding activities that require good vision</li>
</ul>

<h2>Common Childhood Vision Problems</h2>
<p>Some common conditions we diagnose and treat include nearsightedness (myopia), farsightedness (hyperopia), astigmatism, and lazy eye (amblyopia). Early detection is key to successful treatment.</p>
<p>Bring your child to Best Vision Eye Care for a pediatric eye examination in a friendly, child-appropriate environment. Our team is trained to work with children and make the experience comfortable and even fun.</p>',
                'category' => 'Pediatric Care',
                'tags' => 'children, pediatric, eye exam, vision screening, school',
                'featured_image' => 'https://picsum.photos/seed/children-vision/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(7),
            ],
            [
                'title' => 'Glaucoma: The Silent Thief of Sight You Need to Know About',
                'slug' => 'glaucoma-silent-thief-sight-awareness',
                'excerpt' => 'Glaucoma is often called the silent thief of sight because it can cause irreversible vision loss without warning. Learn about risk factors, detection, and management.',
                'content' => '<h2>What Is Glaucoma?</h2>
<p>Glaucoma is a group of eye conditions that damage the optic nerve, which is vital for good vision. This damage is often caused by abnormally high pressure in the eye. Glaucoma is one of the leading causes of blindness for people over the age of 60.</p>

<h2>Why Is It Called the Silent Thief?</h2>
<p>The most common form, open-angle glaucoma, has no noticeable symptoms in its early stages. Vision loss begins with peripheral (side) vision and gradually progresses to central vision. Many people do not realize they have the condition until significant vision loss has occurred.</p>

<h2>Who Is at Risk?</h2>
<ul>
<li>People over 60 years of age</li>
<li>Family history of glaucoma</li>
<li>African or Hispanic ancestry</li>
<li>High eye pressure (intraocular pressure)</li>
<li>Diabetes, high blood pressure, or heart disease</li>
<li>Severe nearsightedness</li>
</ul>

<h2>Detection and Treatment at Best Vision</h2>
<p>Regular comprehensive eye exams are the best way to detect glaucoma early. Our clinic offers advanced diagnostic testing including tonometry (eye pressure measurement), optical coherence tomography (OCT), and visual field testing.</p>
<p>While glaucoma cannot be cured, it can be managed. Treatment options include medicated eye drops, laser therapy, and surgical procedures. Early detection and consistent treatment can slow or halt vision loss.</p>
<p>If you are at risk, schedule an eye exam at Best Vision Eye Care today. Protecting your sight starts with a single appointment.</p>',
                'category' => 'Eye Conditions',
                'tags' => 'glaucoma, optic nerve, eye pressure, blindness prevention',
                'featured_image' => 'https://picsum.photos/seed/glaucoma/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(10),
            ],
            [
                'title' => 'Choosing the Right Eyeglasses Frames for Your Face Shape',
                'slug' => 'choosing-right-eyeglasses-frames-face-shape',
                'excerpt' => 'Finding the perfect pair of eyeglasses is about more than just prescription accuracy. Learn how to choose frames that complement your face shape and express your personal style.',
                'content' => '<h2>Understanding Your Face Shape</h2>
<p>The key to finding flattering eyeglass frames is understanding your face shape. The main face shapes are round, oval, square, heart, and diamond. Each shape benefits from different frame styles that create balance and harmony.</p>

<h2>Round Face</h2>
<p>If your face has soft curves and roughly equal width and length, you have a round face shape. Angular frames like rectangles, squares, and cat-eye styles work best, as they add definition and make the face appear longer.</p>

<h2>Oval Face</h2>
<p>Oval faces are longer than they are wide with balanced proportions. Most frame styles work well with oval faces. Experiment with bold geometric shapes, aviators, or wayfarers to highlight your features.</p>

<h2>Square Face</h2>
<p>If you have a strong jawline and broad forehead, you have a square face shape. Round or oval frames soften angular features. Rimless and semi-rimless styles also work beautifully.</p>

<h2>Heart Face</h2>
<p>Heart-shaped faces are wider at the forehead and narrower at the chin. Bottom-heavy frames like aviators, round, and oval styles balance the face. Look for frames with a narrow bridge and lighter colors at the top.</p>

<h2>Visit Our Optical Center</h2>
<p>At Best Vision Eye Care, we carry a wide selection of high-quality frames from trusted brands. Our trained opticians will help you find the perfect fit based on your face shape, prescription needs, and personal style preferences. Visit our clinic in Natta-Mwanza to browse our collection.</p>',
                'category' => 'Eyewear',
                'tags' => 'eyeglasses, frames, face shape, fashion, optical',
                'featured_image' => 'https://picsum.photos/seed/eyeglasses-frames/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(14),
            ],
            [
                'title' => 'Dry Eye Syndrome: Causes, Relief, and When to See a Doctor',
                'slug' => 'dry-eye-syndrome-causes-relief-treatment',
                'excerpt' => 'Dry eyes can be more than just a minor annoyance — they can significantly impact your quality of life. Explore the causes of dry eye syndrome and discover effective relief strategies.',
                'content' => '<h2>What Is Dry Eye Syndrome?</h2>
<p>Dry eye syndrome is a common condition that occurs when your tears cannot provide adequate lubrication for your eyes. This can happen either because your eyes don\'t produce enough tears or because your tears evaporate too quickly.</p>

<h2>Common Symptoms</h2>
<ul>
<li>Stinging or burning sensation</li>
<li>Redness and irritation</li>
<li>Stringy mucus in or around the eyes</li>
<li>Sensitivity to light</li>
<li>Blurred vision, especially after reading or screen time</li>
<li>Feeling like something is in your eye</li>
<li>Watery eyes (a reflex response to dryness)</li>
</ul>

<h2>What Causes Dry Eyes?</h2>
<p>Multiple factors can contribute to dry eye syndrome:</p>
<ul>
<li>Aging (most common in people over 50)</li>
<li>Environmental conditions (wind, dry air, smoke)</li>
<li>Prolonged screen use (reduced blinking)</li>
<li>Certain medications (antihistamines, decongestants)</li>
<li>Medical conditions (rheumatoid arthritis, diabetes, thyroid disorders)</li>
<li>Contact lens wear</li>
</ul>

<h2>Relief and Treatment Options</h2>
<p>We offer a range of treatments at Best Vision Eye Care tailored to your specific needs:</p>
<ul>
<li>Artificial tears and lubricating eye drops</li>
<li>Prescription medications to increase tear production</li>
<li>Punctal plugs to conserve tears</li>
<li>Lid hygiene and warm compresses</li>
<li>Dietary changes including omega-3 supplements</li>
</ul>

<h2>When to Visit Best Vision Eye Care</h2>
<p>If you\'ve been experiencing dry eye symptoms for more than a few days, or if they interfere with your daily activities, it is time to schedule an appointment. Our eye care professionals can diagnose the underlying cause and develop a personalized treatment plan to keep your eyes comfortable and healthy.</p>',
                'category' => 'Eye Health',
                'tags' => 'dry eye, lubrication, eye drops, screen time, relief',
                'featured_image' => 'https://picsum.photos/seed/dry-eye/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(18),
            ],
            [
                'title' => 'Community Outreach: Bringing Eye Care to Underserved Areas in Mwanza',
                'slug' => 'community-outreach-eye-care-mwanza',
                'excerpt' => 'Best Vision Eye Care is committed to serving beyond our clinic walls. Read about our recent community outreach programs bringing essential eye care services to underserved communities in the Mwanza region.',
                'content' => '<h2>Our Commitment to Community Health</h2>
<p>At Best Vision Eye Care, we believe that quality eye care should be accessible to everyone, regardless of their location or economic status. That is why we have launched a series of community outreach programs across the Mwanza region.</p>

<h2>Recent Outreach Initiatives</h2>
<p>Over the past year, our mobile eye clinic has visited several communities in the Natta-Mwanza area, providing free or low-cost eye screenings to hundreds of residents who previously had limited access to eye care services.</p>
<p>Our services during these outreach events include:</p>
<ul>
<li>Vision screening and refraction testing</li>
<li>Distribution of reading glasses and prescription eyewear</li>
<li>Detection and referral for cataracts, glaucoma, and other conditions</li>
<li>Education on eye health and hygiene</li>
<li>Pediatric vision screenings for school children</li>
</ul>

<h2>Impact and Results</h2>
<p>Our outreach programs have reached over 500 individuals in the past year. Of these, approximately 30% were identified as needing further treatment or corrective eyewear. Many children received their first-ever eye examination through our school-based screening programs.</p>

<h2>How You Can Help</h2>
<p>We welcome partnerships with community organizations, schools, and local government to expand our reach. If you would like to support our outreach efforts or host a screening event in your community, please contact us.</p>
<p>Together, we can build a healthier, clearer-sighted future for Mwanza.</p>',
                'category' => 'Community',
                'tags' => 'outreach, community, Mwanza, free screening, mobile clinic',
                'featured_image' => 'https://picsum.photos/seed/community-outreach/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(21),
            ],
            [
                'title' => 'Understanding Your Eyeglass Prescription: A Simple Guide',
                'slug' => 'understanding-eyeglass-prescription-guide',
                'excerpt' => 'Eyeglass prescriptions can look like a confusing jumble of numbers and abbreviations. This simple guide breaks down what each part means so you can understand your vision needs better.',
                'content' => '<h2>Anatomy of a Prescription</h2>
<p>When you receive an eyeglass prescription, it typically includes abbreviations and numbers for each eye. Here is what they mean:</p>

<h2>OD and OS</h2>
<p>OD stands for "oculus dexter" (right eye), and OS stands for "oculus sinister" (left eye). OU (oculus uterque) means both eyes.</p>

<h2>Sphere (SPH)</h2>
<p>The sphere value indicates the lens power needed to correct nearsightedness or farsightedness. A minus sign (-) means you are nearsighted (difficulty seeing far away). A plus sign (+) means you are farsighted (difficulty seeing up close). The higher the number, the stronger the prescription.</p>

<h2>Cylinder (CYL) and Axis</h2>
<p>These values correct astigmatism, a condition where the cornea is irregularly shaped. The cylinder indicates the lens power needed, and the axis (0-180 degrees) specifies where the astigmatism is located on the cornea.</p>

<h2>Add</h2>
<p>The "add" value is used for multifocal or progressive lenses, indicating additional magnifying power needed for reading and close work. This is common in prescriptions for people over 40.</p>

<h2>Pupillary Distance (PD)</h2>
<p>PD is the distance between the centers of your pupils, measured in millimeters. This measurement ensures your lenses are centered correctly for optimal vision.</p>

<h2>Visit Best Vision Eye Care</h2>
<p>Our optometrists take the time to explain your prescription and answer any questions. We ensure your eyeglasses are crafted precisely to your specifications. Schedule an appointment today for a comprehensive eye examination.</p>',
                'category' => 'Eyewear',
                'tags' => 'prescription, eyeglasses, SPH, CYL, astigmatism',
                'featured_image' => 'https://picsum.photos/seed/prescription-guide/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(25),
            ],
            [
                'title' => 'The Link Between Diabetes and Eye Health: What You Need to Know',
                'slug' => 'diabetes-eye-health-diabetic-retinopathy',
                'excerpt' => 'Diabetes can have serious implications for your vision. Learn about diabetic retinopathy and why annual eye exams are essential for anyone living with diabetes.',
                'content' => '<h2>Diabetes and Your Eyes</h2>
<p>Diabetes is a systemic condition that affects blood vessels throughout the body, including the tiny blood vessels in your retina. When these vessels are damaged, a condition called diabetic retinopathy can develop.</p>

<h2>What Is Diabetic Retinopathy?</h2>
<p>Diabetic retinopathy is a diabetes complication that affects the eyes. It is caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina). Initially, it may cause no symptoms or only mild vision problems, but it can eventually lead to blindness.</p>

<h2>Stages of Diabetic Retinopathy</h2>
<ul>
<li><strong>Non-proliferative diabetic retinopathy (NPDR):</strong> Early stage with weakened blood vessels that may leak fluid.</li>
<li><strong>Proliferative diabetic retinopathy (PDR):</strong> Advanced stage where new, abnormal blood vessels grow on the retina, which can bleed and cause severe vision loss.</li>
</ul>

<h2>Prevention and Management</h2>
<p>The best defense against diabetic eye disease is proactive management:</p>
<ul>
<li>Control blood sugar levels</li>
<li>Monitor blood pressure and cholesterol</li>
<li>Schedule annual dilated eye exams</li>
<li>Seek prompt treatment if vision changes occur</li>
</ul>

<h2>Best Vision Eye Care Can Help</h2>
<p>Our clinic offers comprehensive diabetic eye examinations using advanced retinal imaging technology. Early detection and treatment can prevent up to 90% of vision loss from diabetic retinopathy. If you have diabetes, do not wait — schedule your annual eye exam today.</p>',
                'category' => 'Eye Health',
                'tags' => 'diabetes, diabetic retinopathy, blood sugar, retinal damage',
                'featured_image' => 'https://picsum.photos/seed/diabetes-eye/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(28),
            ],
            [
                'title' => 'How Blue Light Affects Your Eyes and What You Can Do About It',
                'slug' => 'blue-light-effects-eyes-protection',
                'excerpt' => 'In our digital age, blue light exposure is everywhere — from smartphones to computer screens. Discover how blue light affects your eyes and practical steps to protect your vision.',
                'content' => '<h2>What Is Blue Light?</h2>
<p>Blue light is a color in the visible light spectrum that can be seen by the human eye. It has a short wavelength and produces higher amounts of energy. Blue light is emitted by the sun as well as digital screens, LED lighting, and fluorescent lights.</p>

<h2>Digital Eye Strain</h2>
<p>Extended screen time can lead to digital eye strain, also known as computer vision syndrome. Symptoms include dry eyes, blurred vision, headaches, and neck or shoulder pain. While blue light is not the sole cause, it contributes to discomfort, especially during prolonged use.</p>

<h2>Sleep Disruption</h2>
<p>Exposure to blue light in the evening can suppress the production of melatonin, the hormone that regulates sleep-wake cycles. This can make it harder to fall asleep and reduce sleep quality. Limiting screen time before bed is recommended.</p>

<h2>Protecting Your Eyes</h2>
<ul>
<li><strong>Blue light filtering lenses:</strong> Ask us about lens coatings that reduce blue light exposure from digital screens.</li>
<li><strong>20-20-20 rule:</strong> Every 20 minutes, look at something 20 feet away for 20 seconds.</li>
<li><strong>Adjust screen settings:</strong> Enable night mode or blue light filters on your devices in the evening.</li>
<li><strong>Take breaks:</strong> Step away from screens regularly to rest your eyes.</li>
</ul>

<h2>Visit Us for Personalized Advice</h2>
<p>Our optometrists can help you determine if blue light filtering lenses are right for your lifestyle. We offer a range of lens options that can be added to your prescription eyewear. Schedule a consultation at Best Vision Eye Care to learn more.</p>',
                'category' => 'Eye Health',
                'tags' => 'blue light, digital eye strain, screen time, sleep, lenses',
                'featured_image' => 'https://picsum.photos/seed/blue-light/800/500',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(32),
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::create($post + ['created_by' => 1]);
        }

        $this->command->info('Blog posts seeded successfully!');
    }
}
