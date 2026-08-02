export interface HeroCodeSlide {
  title: string
  html: string
}

const lineCount = (html: string) =>
  html.split('<span class="line">').length - 1

export const heroCodeMaxLines = () =>
  Math.max(...heroCodeSlides.map((s) => lineCount(s.html)))

export const heroCodeSlides: HeroCodeSlide[] = [
  {
    title: 'main.ell',
    html: `<pre class="shiki shiki-themes github-light github-dark vp-code" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#032F62;--shiki-dark:#9ECBFF">"Fun to learn, delightful to ship"</span></span>
<span class="line"><span style="color:#D73A49;--shiki-dark:#F97583">|></span><span style="color:#6F42C1;--shiki-dark:#B392F0"> String</span><span style="color:#24292E;--shiki-dark:#E1E4E8">.downcase()</span></span>
<span class="line"><span style="color:#D73A49;--shiki-dark:#F97583">|></span><span style="color:#6F42C1;--shiki-dark:#B392F0"> String</span><span style="color:#24292E;--shiki-dark:#E1E4E8">.replace(</span><span style="color:#032F62;--shiki-dark:#9ECBFF">","</span><span style="color:#24292E;--shiki-dark:#E1E4E8">, </span><span style="color:#032F62;--shiki-dark:#9ECBFF">""</span><span style="color:#24292E;--shiki-dark:#E1E4E8">)</span></span>
<span class="line"><span style="color:#D73A49;--shiki-dark:#F97583">|></span><span style="color:#6F42C1;--shiki-dark:#B392F0"> String</span><span style="color:#24292E;--shiki-dark:#E1E4E8">.split()</span></span>
<span class="line"><span style="color:#D73A49;--shiki-dark:#F97583">|></span><span style="color:#6F42C1;--shiki-dark:#B392F0"> Enum</span><span style="color:#24292E;--shiki-dark:#E1E4E8">.frequencies()</span></span>
<span class="line"><span style="color:#D73A49;--shiki-dark:#F97583">|></span><span style="color:#6F42C1;--shiki-dark:#B392F0"> IO</span><span style="color:#24292E;--shiki-dark:#E1E4E8">.println()</span></span>
<span class="line"></span></code></pre>`,
  },
]
